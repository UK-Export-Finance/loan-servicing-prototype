/* eslint-disable no-param-reassign */
import { Injectable, Inject, NotImplementedException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Transactional } from 'typeorm-transactional'
import {
  Transaction,
  DrawingProjectedEvent,
  FacilityEvent,
  LoanServicingEvent,
  ProjectedEvent,
  CreateNewFacilityEvent,
  Facility,
  FacilityProjectedEvent,
} from 'loan-servicing-common'
import TransactionEntity from 'models/entities/TransactionEntity'
import DrawingEntity from 'models/entities/DrawingEntity'
import EventService from 'modules/event/event.service'
import DrawingEventHandlingService from 'modules/projections/drawing.service.events'
import EventEntity from 'models/entities/EventEntity'
import FacilityEntity from 'models/entities/FacilityEntity'
import FacilityEventHandlingService from './facility.service.events'
import FacilityProjection from './projection'

@Injectable()
class ProjectionsService {
  constructor(
    @Inject(EventService) private eventService: EventService,
    @InjectRepository(TransactionEntity)
    private transactionRepo: Repository<TransactionEntity>,
    @InjectRepository(FacilityEntity)
    private facilityRepo: Repository<FacilityEntity>,
    @Inject(DrawingEventHandlingService)
    private drawingEventHandler: DrawingEventHandlingService,
    @Inject(FacilityEventHandlingService)
    private facilityEventHandler: FacilityEventHandlingService,
  ) {}

  @Transactional()
  async buildProjectionsForFacilityOnDate(
    facilityId: string,
    date: Date = new Date(),
  ): Promise<{
    facility: FacilityEntity
    transactions: Transaction[]
  }> {
    const { facility, facilityEvents, facilityStreamVersion } =
      await this.intialiseFacility(facilityId)
    const projection = await this.applyEventsUntil(
      facilityEvents,
      facility,
      date,
    )

    projection.facility.streamVersion = facilityStreamVersion

    const CHUNK_SIZE = 50
    const chunkedTransactions = []
    for (let i = 0; i < projection.transactions.length; i += CHUNK_SIZE) {
      chunkedTransactions.push(projection.transactions.slice(i, i + CHUNK_SIZE))
    }
    const transactionSaveResults = await Promise.all(
      chunkedTransactions.map((chunk) =>
        this.transactionRepo.insert(chunk as TransactionEntity[]),
      ),
    )
    const transactionEntities = transactionSaveResults.reduce(
      (res: TransactionEntity[], curr) =>
        res.concat(curr.generatedMaps as TransactionEntity[]),
      [] as TransactionEntity[],
    )
    const allEvents = [
      ...projection.processedEvents,
      ...projection.unprocessedEvents,
    ]
    projection.facility.drawings.forEach((d) => {
      d.facility = projection.facility
      const streamIds = allEvents
        .filter((e) => e.streamId === d.streamId)
        .map((e) => e.streamVersion)
        .filter((e) => e !== undefined) as number[]
      d.streamVersion = Math.max(...streamIds)
      d.currentDate = date
    })
    projection.facility.streamVersion = Math.max(
      ...(allEvents
        .filter((e) => e.streamId === projection.facility.streamId)
        .map((e) => e.streamVersion)
        .filter((e) => e !== undefined) as number[]),
    )
    // Deleting & rebuilding circular facility-drawing reference as TypeORM can't handle it
    projection.facility.drawings.forEach((d) => delete (d as any).facility)
    projection.facility.currentDate = date
    const facilityEntity = await this.facilityRepo.save(projection.facility)

    return {
      facility: facilityEntity,
      transactions: transactionEntities,
    }
  }

  @Transactional()
  async buildProjectionsForDrawingOnDate(
    facilityId: string,
    drawingId: string,
    date?: Date,
  ): Promise<{
    facility: FacilityEntity
    drawing: DrawingEntity
    transactions: Transaction[]
  }> {
    const { facility, transactions } =
      await this.buildProjectionsForFacilityOnDate(facilityId, date)
    const drawing = facility.drawings.find((d) => d.streamId === drawingId)
    if (!drawing) {
      throw new Error(`Facility did not contain expected drawing`)
    }
    return {
      facility,
      drawing,
      transactions,
    }
  }

  applyEventsUntil = async (
    events: ProjectedEvent[],
    facility: Facility,
    until: Date,
  ): Promise<FacilityProjection> => {
    const projection = new FacilityProjection(facility, [...events], until)
    let curr = projection.consumeNextEvent()
    while (curr) {
      // eslint-disable-next-line no-await-in-loop
      await this.applyEvent(curr, projection)
      curr = projection.consumeNextEvent()
    }
    return projection
  }

  applyAllEvents = async (
    events: ProjectedEvent[],
    facility: Facility,
  ): Promise<FacilityProjection> =>
    this.applyEventsUntil(events, facility, new Date(4000, 0, 0))

  applyEvent = async (
    event: ProjectedEvent,
    projection: FacilityProjection,
  ): Promise<void> => {
    switch (event.entityType) {
      case 'drawing':
        await this.drawingEventHandler.applyEvent(
          event as DrawingProjectedEvent,
          projection,
        )
        return
      case 'facility':
        await this.facilityEventHandler.applyEvent(
          event as FacilityProjectedEvent,
          projection,
        )
        return
      default:
        throw new NotImplementedException()
    }
  }

  intialiseFacility = async (
    facilityId: string,
  ): Promise<{
    facility: Facility
    facilityEvents: FacilityEvent[]
    facilityStreamVersion: number
  }> => {
    await this.transactionRepo.delete({ streamId: facilityId })
    const facilityEvents =
      (await this.eventService.getActiveEventsInCreationOrder(
        facilityId,
      )) as FacilityEvent[]
    const facility = this.getFacilityAtCreation(facilityEvents)

    return {
      facility,
      facilityEvents,
      facilityStreamVersion:
        facilityEvents[facilityEvents.length - 1].streamVersion,
    }
  }

  getFacilityAtCreation = (facilityEvents: LoanServicingEvent[]): Facility => {
    const creationEvent =
      facilityEvents[0] as EventEntity<CreateNewFacilityEvent>

    if (creationEvent.type !== 'CreateNewFacility') {
      throw new Error('First created event is not facility creation')
    }

    const entity: Facility = {
      streamId: creationEvent.streamId,
      streamVersion: 1,
      drawnAmount: '0',
      currentDate: creationEvent.effectiveDate,
      undrawnAmount: creationEvent.eventData.facilityAmount,
      facilityFees: [],
      ...creationEvent.eventData,
      drawings: [],
    }

    return this.facilityRepo.create(entity)
  }
}

export default ProjectionsService
