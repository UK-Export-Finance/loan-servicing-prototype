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
  ProjectedParticipationEvent,
} from 'loan-servicing-common'
import TransactionEntity from 'models/entities/TransactionEntity'
import DrawingEntity from 'models/entities/DrawingEntity'
import EventService from 'modules/event/event.service'
import DrawingEventHandlingService from 'modules/projections/eventHandlers/drawing.events.service'
import EventEntity from 'models/entities/EventEntity'
import FacilityEntity from 'models/entities/FacilityEntity'
import SystemValueService from 'modules/systemValue/systemValue.service'
import FacilityEventHandlingService from './eventHandlers/facility.events.service'
import FacilityBuilder, {
  FacilityProjectionSnapshot,
  ParticipationProjectionSnapshot,
} from './builders/FacilityBuilder'
import RootFacilityBuilder from './builders/RootFacilityBuilder'
import ParticipationEventHandlingService from './eventHandlers/participation.events.service'

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
    @Inject(ParticipationEventHandlingService)
    private participationEventHandler: ParticipationEventHandlingService,
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

    const rootProjection = new RootFacilityBuilder(
      facility,
      [...facilityEvents],
      date,
    )

    const initialisationEvents = rootProjection.consumeInitialisationEvents()
    initialisationEvents.forEach((e) => this.applyEvent(e, rootProjection))

    const { facilityAtProjectionDate, projectionAtExpiry } =
      await this.applyProjectionEvents(rootProjection)

    const {
      rootFacility: currentFacility,
      participationSnapshots,
      transactions,
      processedEvents,
      unprocessedEvents,
    } = facilityAtProjectionDate as FacilityProjectionSnapshot

    await this.createPendingEvents(currentFacility, projectionAtExpiry, date)

    const transactionEntities = await this.saveTransactions(transactions)
    await Promise.all(
      participationSnapshots.map((p) => this.saveTransactions(p.transactions)),
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
    await Promise.all(
      currentFacility.participations.map((p) => this.facilityRepo.save(p)),
    )

    return {
      facility: facilityEntity,
      transactions: transactionEntities,
    }
  }

  private async saveTransactions(
    transactions: Transaction[],
  ): Promise<TransactionEntity[]> {
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
    return transactionSaveResults.reduce(
      (res: TransactionEntity[], curr) =>
        res.concat(curr.generatedMaps as TransactionEntity[]),
      [] as TransactionEntity[],
    )
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

  applyProjectionEvents = async (
    projection: FacilityBuilder,
  ): Promise<{
    facilityAtProjectionDate:
      | FacilityProjectionSnapshot
      | ParticipationProjectionSnapshot
    projectionAtExpiry: FacilityBuilder
  }> => {
    await this.applyCompletedEvents(projection)
    if (projection.participationBuilders) {
      await Promise.all(
        projection.participationBuilders.map((p) =>
          this.applyCompletedEvents(p),
        ),
      )
    }
    const facilityAtProjectionDate = projection.takeSnapshot()
    await this.applyFutureEvents(projection)
    if (projection.participationBuilders) {
      await Promise.all(
        projection.participationBuilders.map((p) => this.applyFutureEvents(p)),
      )
    }

    return {
      facilityAtProjectionDate,
      projectionAtExpiry: projection,
    }
  }

  private async applyCompletedEvents(
    projection: FacilityBuilder,
  ): Promise<void> {
    let curr = projection.consumeNextCompletedEvent()
    while (curr) {
      // eslint-disable-next-line no-await-in-loop
      await this.applyEvent(curr, projection)
      curr = projection.consumeNextCompletedEvent()
    }
  }

  private async applyFutureEvents(projection: FacilityBuilder): Promise<void> {
    let futureEvent = projection.consumeNextEvent()
    while (futureEvent) {
      // eslint-disable-next-line no-await-in-loop
      await this.applyEvent(futureEvent, projection)
      futureEvent = projection.consumeNextEvent()
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
      case 'participation':
        await this.participationEventHandler.applyEvent(
          event as ProjectedParticipationEvent,
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

    if (creationEvent.type in ['CreateNewFacility', 'CreateNewParticipation']) {
      throw new Error('First created event is not facility creation')
    }

    const entity: Facility = {
      streamId: creationEvent.streamId,
      streamVersion: 1,
      drawnAmount: '0',
      participations: [],
      participationsConfig: [],
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
