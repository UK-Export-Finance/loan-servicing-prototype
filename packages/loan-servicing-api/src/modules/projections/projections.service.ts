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
import FacilityBuilder from './FacilityBuilder'

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

    const builtFacility = projection.build()

    builtFacility.streamVersion = facilityStreamVersion

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
    await this.createPendingEvents(builtFacility, projection.projectionDate)
    const transactionEntities = transactionSaveResults.reduce(
      (res: TransactionEntity[], curr) =>
        res.concat(curr.generatedMaps as TransactionEntity[]),
      [] as TransactionEntity[],
    )
    const allEvents = [
      ...projection.processedEvents,
      ...projection.unprocessedEvents,
    ]
    builtFacility.drawings.forEach((d) => {
      d.facility = builtFacility
      const streamIds = allEvents
        .filter((e) => e.streamId === d.streamId)
        .map((e) => e.streamVersion)
        .filter((e) => e !== undefined) as number[]
      d.streamVersion = Math.max(...streamIds)
      d.currentDate = date
    })
    builtFacility.streamVersion = Math.max(
      ...(allEvents
        .filter((e) => e.streamId === builtFacility.streamId)
        .map((e) => e.streamVersion)
        .filter((e) => e !== undefined) as number[]),
    )
    // Deleting & rebuilding circular facility-drawing reference as TypeORM can't handle it
    builtFacility.drawings.forEach((d) => delete (d as any).facility)
    builtFacility.currentDate = date
    const facilityEntity = await this.facilityRepo.save(builtFacility)

    return {
      facility: facilityEntity,
      transactions: transactionEntities,
    }
  }

  async createPendingEvents(facility: Facility, date: Date): Promise<void> {
    await Promise.all(
      facility.drawings.map((d) =>
        this.drawingEventHandler.addPendingRepayments(
          d.repayments.filter((r) => r.date > date),
          d,
        ),
      ),
    )
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
  ): Promise<FacilityBuilder> => {
    const projection = new FacilityBuilder(facility, [...events], until)
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
  ): Promise<FacilityBuilder> =>
    this.applyEventsUntil(events, facility, new Date(4000, 0, 0))

  applyEvent = async (
    event: ProjectedEvent,
    projection: FacilityBuilder,
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
