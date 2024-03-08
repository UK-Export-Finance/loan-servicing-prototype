/* eslint-disable no-param-reassign */
import { Injectable, Inject, NotImplementedException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Transactional } from 'typeorm-transactional'
import {
  Transaction,
  CreateNewDrawingEvent,
  DrawingEvent,
  DrawingProjectedEvent,
  FacilityEvent,
  LoanServicingEvent,
  sortEventByEffectiveDate,
  ProjectedEvent,
  CreateNewFacilityEvent,
  Drawing,
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

@Injectable()
class ProjectionsService {
  constructor(
    @Inject(EventService) private eventService: EventService,
    @InjectRepository(TransactionEntity)
    private transactionRepo: Repository<TransactionEntity>,
    @InjectRepository(DrawingEntity)
    private drawingRepo: Repository<DrawingEntity>,
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
    const transactions = this.applyEvents(facilityProjectedEvents, facility)

    facility.streamVersion = facilityStreamVersion

    const transactionEntities = await this.transactionRepo.save(
      transactions as TransactionEntity[],
      { chunk: 100 },
    )
    const facilityEntity = await this.facilityRepo.save(facility)

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
    const { drawing, drawingProjectedEvents, drawingStreamVersion } =
      await this.intialiseDrawing(facilityId, drawingId)
    const { facility, facilityProjectedEvents, facilityStreamVersion } =
      await this.intialiseFacility(facilityId)

    const projectedEvents = [
      ...drawingProjectedEvents,
      ...facilityProjectedEvents,
    ].sort(sortEventByEffectiveDate)

    const transactions = this.applyEvents(projectedEvents, facility, drawing)

    drawing.streamVersion = drawingStreamVersion
    drawing.facilityStreamId = facilityId

    facility.streamVersion = facilityStreamVersion

    const transactionEntities = await this.transactionRepo.save(
      transactions as TransactionEntity[],
      { chunk: 100 },
    )
    const facilityEntity = await this.facilityRepo.save(facility)
    const drawingEntity = await this.drawingRepo.save(drawing)

    return {
      facility: facilityEntity,
      drawing: drawingEntity,
      transactions: transactionEntities,
    }
  }

  applyEvents = (
    events: ProjectedEvent[],
    facility: Facility,
    drawing?: Drawing,
  ): Transaction[] =>
    events.reduce(
      (
        transactions: Transaction[],
        sourceEvent: ProjectedEvent,
        eventIndex: number,
        allEvents: ProjectedEvent[],
      ) => {
        switch (sourceEvent.entityType) {
          case 'drawing':
            if (!drawing) {
              throw new Error(
                'Event is for drawing but no drawing entity provided',
              )
            }
            return this.drawingEventHandler.applyEvent({
              entity: drawing,
              transactions,
              sourceEvent: sourceEvent as DrawingProjectedEvent,
              eventIndex,
              allEvents,
            })
          case 'facility':
            return this.facilityEventHandler.applyEvent({
              entity: facility,
              transactions,
              sourceEvent: sourceEvent as FacilityProjectedEvent,
              eventIndex,
              allEvents,
            })
          default:
            throw new NotImplementedException()
        }
      },
      [],
    )

  intialiseFacility = async (
    facilityId: string,
  ): Promise<{
    facility: Facility
    facilityProjectedEvents: FacilityProjectedEvent[]
    facilityStreamVersion: number
  }> => {
    await this.transactionRepo.delete({ streamId: facilityId })
    await this.facilityRepo.delete({ streamId: facilityId })
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

  intialiseDrawing = async (
    facilityId: string,
    drawingId: string,
  ): Promise<{
    drawing: Drawing
    drawingProjectedEvents: DrawingProjectedEvent[]
    drawingStreamVersion: number
  }> => {
    await this.transactionRepo.delete({ streamId: drawingId })
    await this.drawingRepo.delete({ streamId: drawingId })
    // Need to handle events which change config affecting projected event generation

    const drawingEvents = (await this.eventService.getEventsInCreationOrder(
      drawingId,
    )) as DrawingEvent[]

    const drawing = this.getDrawingAtCreation(drawingEvents, facilityId)
    const drawingProjectedEvents =
      await this.drawingEventHandler.getProjectedEvents(drawing)

    return {
      drawing,
      drawingProjectedEvents,
      drawingStreamVersion:
        drawingEvents[drawingEvents.length - 1].streamVersion,
    }
  }

  getFacilityAtCreation = (facilityEvents: LoanServicingEvent[]): Facility => {
    const creationEvent =
      facilityEvents[0] as EventEntity<CreateNewFacilityEvent>

    if (creationEvent.type !== 'CreateNewFacility') {
      throw new Error('First created event is not facility creation')
    }

    const entity: Omit<Facility, 'drawings'> = {
      streamId: creationEvent.streamId,
      streamVersion: 1,
      drawnAmount: '0',
      undrawnAmount: creationEvent.eventData.facilityAmount,
      ...creationEvent.eventData,
    }

    return this.facilityRepo.create(entity)
  }

  getDrawingAtCreation = (
    drawingEvents: DrawingEvent[],
    facilityId: string,
  ): DrawingEntity => {
    const creationEvent = drawingEvents[0] as EventEntity<CreateNewDrawingEvent>

    if (creationEvent.type !== 'CreateNewDrawing') {
      throw new Error('First created event is not drawing creation')
    }

    return this.drawingRepo.create({
      streamId: creationEvent.streamId,
      streamVersion: 1,
      facilityStreamId: facilityId,
      outstandingPrincipal: '0',
      ...creationEvent.eventData,
    })
  }
}

export default ProjectionsService
