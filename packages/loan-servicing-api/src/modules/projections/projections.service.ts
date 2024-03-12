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
  async buildProjectionsForFacility(facilityId: string): Promise<{
    facility: FacilityEntity
    transactions: Transaction[]
  }> {
    const { facility, facilityProjectedEvents, facilityStreamVersion } =
      await this.intialiseFacility(facilityId)
    const projection = await this.applyAllEvents(
      facilityProjectedEvents,
      facility,
    )

    projection.facility.streamVersion = facilityStreamVersion

    const transactionEntities = await this.transactionRepo.save(
      projection.transactions as TransactionEntity[],
      { chunk: 100 },
    )
    // Deleting & rebuilding circular facility-drawing reference as TypeORM can't handle it
    projection.facility.drawings.forEach((d) => delete (d as any).facility)
    const facilityEntity = await this.facilityRepo.save(projection.facility)
    facilityEntity.drawings.forEach((d) => {
      d.facility = facilityEntity
    })
    return { facility: facilityEntity, transactions: transactionEntities }
  }

  @Transactional()
  async buildProjectionsForDrawing(
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

  applyAllEvents = async (
    events: ProjectedEvent[],
    facility: Facility,
  ): Promise<FacilityProjection> => {
    const projection = new FacilityProjection(facility, [...events])
    let curr = projection.consumeNextEvent()
    while (curr) {
      // eslint-disable-next-line no-await-in-loop
      await this.applyEvent(curr, projection)
      curr = projection.consumeNextEvent()
    }
    return projection
  }

  applyEvent = async (
    event: ProjectedEvent,
    projection: FacilityProjection,
  ): Promise<void> => {
    switch (event.entityType) {
      case 'drawing':
        if (event.streamVersion) {
          projection.setDrawingProperty(
            event.streamId,
            'streamVersion',
            event.streamVersion,
          )
        }
        await this.drawingEventHandler.applyEvent(
          event as DrawingProjectedEvent,
          projection,
        )
        return
      case 'facility':
        if (event.streamVersion) {
          projection.facility.streamVersion = event.streamVersion
        }
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
    facilityProjectedEvents: FacilityProjectedEvent[]
    facilityStreamVersion: number
  }> => {
    await this.transactionRepo.delete({ streamId: facilityId })
    const facilityEvents = (await this.eventService.getEventsInCreationOrder(
      facilityId,
    )) as FacilityEvent[]
    const facility = this.getFacilityAtCreation(facilityEvents)

    const facilityProjectedEvents =
      await this.facilityEventHandler.getProjectedEvents(facility)

    return {
      facility,
      facilityProjectedEvents,
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
      facilityFeeBalance: '0',
      undrawnAmount: creationEvent.eventData.facilityAmount,
      ...creationEvent.eventData,
      drawings: [],
    }

    return this.facilityRepo.create(entity)
  }
}

export default ProjectionsService
