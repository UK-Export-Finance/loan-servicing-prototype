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
import DrawingEventHandlingService from 'modules/projections/drawing.events.service'
import EventEntity from 'models/entities/EventEntity'
import FacilityEntity from 'models/entities/FacilityEntity'
import SystemValueService from 'modules/systemValue/systemValue.service'
import FacilityEventHandlingService from './facility.events.service'
import FacilityBuilder, {
  FacilityProjectionSnapshot,
} from './builders/FacilityBuilder'

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
    @Inject(SystemValueService)
    private systemValueService: SystemValueService,
  ) {}

  @Transactional()
  async buildProjectionsForFacility(facilityId: string): Promise<{
    facility: FacilityEntity
    transactions: Transaction[]
  }> {
    const date = await this.systemValueService.getSystemDate()
    const { facility, facilityEvents } =
      await this.intialiseFacility(facilityId)

    const {
      facilityAtProjectionDate: {
        facility: currentFacility,
        transactions,
        processedEvents,
        unprocessedEvents,
      },
      projectionAtExpiry,
    } = await this.applyEventsUntil(facilityEvents, facility, date)

    const CHUNK_SIZE = 50
    const chunkedTransactions = []
    for (let i = 0; i < transactions.length; i += CHUNK_SIZE) {
      chunkedTransactions.push(transactions.slice(i, i + CHUNK_SIZE))
    }
    const transactionSaveResults = await Promise.all(
      chunkedTransactions.map((chunk) =>
        this.transactionRepo.insert(chunk as TransactionEntity[]),
      ),
    )
    await this.createPendingEvents(currentFacility, projectionAtExpiry, date)
    const transactionEntities = transactionSaveResults.reduce(
      (res: TransactionEntity[], curr) =>
        res.concat(curr.generatedMaps as TransactionEntity[]),
      [] as TransactionEntity[],
    )

    this.applyStreamVersions(
      currentFacility,
      [...processedEvents, ...unprocessedEvents],
      date,
    )

    // Deleting & rebuilding circular facility-drawing reference as TypeORM can't handle it
    currentFacility.drawings.forEach((d) => delete (d as any).facility)
    currentFacility.currentDate = date
    const facilityEntity = await this.facilityRepo.save(currentFacility)

    return {
      facility: facilityEntity,
      transactions: transactionEntities,
    }
  }

  private applyStreamVersions(
    facility: Facility,
    events: ProjectedEvent[],
    date: Date,
  ): void {
    facility.drawings.forEach((d) => {
      d.facility = facility
      const streamIds = events
        .filter((e) => e.streamId === d.streamId)
        .map((e) => e.streamVersion)
        .filter((e) => e !== undefined) as number[]
      d.streamVersion = Math.max(...streamIds)
      d.currentDate = date
    })
    facility.streamVersion = Math.max(
      ...(events
        .filter((e) => e.streamId === facility.streamId)
        .map((e) => e.streamVersion)
        .filter((e) => e !== undefined) as number[]),
    )
    facility.currentDate = date
  }

  async createPendingEvents(
    currentFacility: Facility,
    projectionAtExpiry: FacilityBuilder,
    date: Date,
  ): Promise<void> {
    currentFacility.drawings.forEach((d) => {
      d.accruals.forEach((a) => {
        a.predictedFinalFee = projectionAtExpiry
          .getDrawingBuilder(d.streamId)
          .getAccrual(a.id).accruedFee
      })
    })
    await Promise.all([
      ...currentFacility.drawings.map((d) =>
        this.drawingEventHandler.addPendingRepayments(
          d.repayments.filter((r) => r.date >= date),
          d,
        ),
      ),
      ...currentFacility.drawings.map((d) =>
        this.drawingEventHandler.addPendingAccrualPayments(
          d.accruals.filter((r) => r.config.expiryDate >= date),
          d,
        ),
      ),
    ])
  }

  @Transactional()
  async buildProjectionsForDrawingOnDate(
    facilityId: string,
    drawingId: string,
  ): Promise<{
    facility: FacilityEntity
    drawing: DrawingEntity
    transactions: Transaction[]
  }> {
    const { facility, transactions } =
      await this.buildProjectionsForFacility(facilityId)
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
  ): Promise<{
    facilityAtProjectionDate: FacilityProjectionSnapshot
    projectionAtExpiry: FacilityBuilder
  }> => {
    const projection = new FacilityBuilder(facility, [...events], until)
    let curr = projection.consumeNextCompletedEvent()
    while (curr) {
      // eslint-disable-next-line no-await-in-loop
      await this.applyEvent(curr, projection)
      curr = projection.consumeNextCompletedEvent()
    }
    const facilityAtProjectionDate = projection.takeSnapshot()
    let futureEvent = projection.consumeNextEvent()
    while (futureEvent) {
      // eslint-disable-next-line no-await-in-loop
      await this.applyEvent(futureEvent, projection)
      futureEvent = projection.consumeNextEvent()
    }

    return {
      facilityAtProjectionDate,
      projectionAtExpiry: projection,
    }
  }

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
      facilityEvents: facilityEvents.filter((e) => e.isApproved),
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
