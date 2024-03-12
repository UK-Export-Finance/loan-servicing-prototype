/* eslint-disable no-param-reassign */
import { Injectable, Inject } from '@nestjs/common'
import {
  CreateNewFacilityEvent,
  AdjustFacilityAmountEvent,
  Facility,
  FacilityEvent,
  FacilityProjectedEvent,
  sortEventByEffectiveDate,
  CalculateFacilityFeeEvent,
  AddDrawingToFacilityEvent,
  Drawing,
  DrawingProjectedEvent,
} from 'loan-servicing-common'
import EventService from 'modules/event/event.service'
import Big from 'big.js'
import { EventHandler, IEventHandlerService } from 'types/eventHandler'
import StrategyService from 'modules/strategy/strategy.service'
import DrawingEntity from 'models/entities/DrawingEntity'
import { InjectRepository } from '@nestjs/typeorm'
import TransactionEntity from 'models/entities/TransactionEntity'
import { Repository } from 'typeorm'
import FacilityProjection from './projection'
import DrawingEventHandlingService from './drawing.service.events'

@Injectable()
class FacilityEventHandlingService
  implements IEventHandlerService<Facility, FacilityProjectedEvent>
{
  constructor(
    @Inject(EventService) private eventService: EventService,
    @Inject(StrategyService) private strategyService: StrategyService,
    @Inject(DrawingEventHandlingService)
    private drawingEventService: DrawingEventHandlingService,
    @InjectRepository(TransactionEntity)
    private transactionRepo: Repository<TransactionEntity>,
    @InjectRepository(DrawingEntity)
    private drawingRepo: Repository<DrawingEntity>,
  ) {}

  getProjectedEvents = async (
    facility: Facility,
  ): Promise<FacilityProjectedEvent[]> => {
    const facilityEvents = (await this.eventService.getEventsInCreationOrder(
      facility.streamId,
    )) as FacilityEvent[]
    const facilityFeeEvents =
      await this.strategyService.getFacilityFeeEvents(facility)

    return [...facilityEvents, ...facilityFeeEvents].sort(
      sortEventByEffectiveDate,
    )
  }

  applyEvent = async <T extends FacilityProjectedEvent>(
    event: T,
    projection: FacilityProjection,
  ): Promise<void> => {
    const handler = this[event.type] as EventHandler<T>
    await handler(event, projection)
  }

  CreateNewFacility: EventHandler<CreateNewFacilityEvent> = async (
    sourceEvent,
    projections,
  ) => {
    projections.transactions.push({
      streamId: projections.facility.streamId,
      sourceEvent,
      datetime: projections.facility.issuedEffectiveDate,
      reference: 'Facility Created',
      valueChanged: 'N/A',
      changeInValue: '0',
      valueAfterTransaction: '0',
    })
  }

  AddDrawingToFacility: EventHandler<AddDrawingToFacilityEvent> = async (
    event,
    projection,
  ) => {
    // Create drawing entity
    const { drawing, drawingProjectedEvents } =
      await this.intialiseDrawing(event)
    // Setup entity relations
    drawing.facility = projection.facility
    projection.facility.drawings.push(drawing)

    // Add drawing events to processing
    projection.addEvents(drawingProjectedEvents)

    projection.transactions.push({
      streamId: event.streamId,
      sourceEvent: event,
      datetime: projection.facility.issuedEffectiveDate,
      reference: 'Drawing Created',
      valueChanged: 'N/A',
      changeInValue: '0',
      valueAfterTransaction: '0',
    })
  }

  intialiseDrawing = async (
    event: AddDrawingToFacilityEvent,
  ): Promise<{
    drawing: Drawing
    drawingProjectedEvents: DrawingProjectedEvent[]
    drawingStreamVersion: number
  }> => {
    await this.transactionRepo.delete({ streamId: event.eventData.streamId })

    const drawing = this.getDrawingAtCreation(event)
    const drawingProjectedEvents =
      await this.drawingEventService.getProjectedEvents(drawing)

    return {
      drawing,
      drawingProjectedEvents,
      drawingStreamVersion: event.streamVersion,
    }
  }

  getDrawingAtCreation = (
    creationEvent: AddDrawingToFacilityEvent,
  ): DrawingEntity => {
    if (creationEvent.type !== 'AddDrawingToFacility') {
      throw new Error('First created event is not drawing creation')
    }

    return this.drawingRepo.create({
      streamVersion: 1,
      outstandingPrincipal: '0',
      ...creationEvent.eventData,
    })
  }

  AdjustFacilityAmount: EventHandler<AdjustFacilityAmountEvent> = async (
    sourceEvent,
    projection,
  ) => {
    const { eventData: incrementEvent } = sourceEvent
    projection.facility.facilityAmount = Big(projection.facility.facilityAmount)
      .add(incrementEvent.adjustment)
      .toFixed(2)
    projection.facility.undrawnAmount = Big(projection.facility.undrawnAmount)
      .add(incrementEvent.adjustment)
      .toFixed(2)
    projection.transactions.push({
      streamId: projection.facility.streamId,
      sourceEvent,
      datetime: projection.facility.issuedEffectiveDate,
      reference: 'Facility Amount Updated',
      valueChanged: 'Facility Amount',
      changeInValue: incrementEvent.adjustment,
      valueAfterTransaction: projection.facility.facilityAmount,
    })
  }

  CalculateFacilityFee: EventHandler<CalculateFacilityFeeEvent> = async (
    sourceEvent,
    projection,
  ) => {
    const feeAmount = this.strategyService.calculateFacilityFee(
      projection.facility,
      sourceEvent,
    )
    projection.facility.facilityFeeBalance = Big(
      projection.facility.facilityFeeBalance,
    )
      .add(feeAmount)
      .toFixed(2)
    projection.transactions.push({
      streamId: projection.facility.streamId,
      sourceEvent,
      datetime: sourceEvent.effectiveDate,
      reference: 'Facility fees',
      valueChanged: 'totalFeeBalance',
      changeInValue: feeAmount,
      valueAfterTransaction: projection.facility.facilityFeeBalance,
    })
  }

  CalculateFixedFacilityFee = this.CalculateFacilityFee

  CalculateAccruingFacilityFee = this.CalculateFacilityFee
}

export default FacilityEventHandlingService
