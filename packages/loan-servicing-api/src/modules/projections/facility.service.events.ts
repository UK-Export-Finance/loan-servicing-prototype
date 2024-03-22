/* eslint-disable no-param-reassign */
import { Injectable, Inject } from '@nestjs/common'
import {
  CreateNewFacilityEvent,
  AdjustFacilityAmountEvent,
  FacilityProjectedEvent,
  CalculateFacilityFeeEvent,
  AddDrawingToFacilityEvent,
  Drawing,
  AddFacilityFeeEvent,
  DrawingEvent,
} from 'loan-servicing-common'
import EventService from 'modules/event/event.service'
import Big from 'big.js'
import { EventHandler, IEventHandlerService } from 'types/eventHandler'
import StrategyService from 'modules/strategy/strategy.service'
import DrawingEntity from 'models/entities/DrawingEntity'
import { InjectRepository } from '@nestjs/typeorm'
import TransactionEntity from 'models/entities/TransactionEntity'
import { Repository } from 'typeorm'
import PendingEventService from 'modules/pendingEvents/pendingEvent.service'
import FacilityBuilder from './builders/FacilityBuilder'

@Injectable()
class FacilityEventHandlingService
  implements IEventHandlerService<FacilityProjectedEvent>
{
  constructor(
    @Inject(EventService) private eventService: EventService,
    @Inject(StrategyService) private strategyService: StrategyService,
    @Inject(PendingEventService)
    private pendingEventService: PendingEventService,
    @InjectRepository(TransactionEntity)
    private transactionRepo: Repository<TransactionEntity>,
    @InjectRepository(DrawingEntity)
    private drawingRepo: Repository<DrawingEntity>,
  ) {}

  applyEvent = async <T extends FacilityProjectedEvent>(
    event: T,
    projection: FacilityBuilder,
  ): Promise<void> => {
    const handler = this[event.type] as EventHandler<T>
    await handler(event, projection)
  }

  CreateNewFacility: EventHandler<CreateNewFacilityEvent> = async (
    sourceEvent,
    projections,
  ) => {
    projections.addTransactions({
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
    const { drawing, drawingEvents: drawingProjectedEvents } =
      await this.intialiseDrawing(event)

    projection.addDrawing(drawing, drawingProjectedEvents)

    projection.addTransactions({
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
    drawingEvents: DrawingEvent[]
    drawingStreamVersion: number
  }> => {
    await Promise.all([
      this.transactionRepo.delete({ streamId: event.eventData.streamId }),
      this.pendingEventService.clearPendingEvents(event.eventData.streamId),
    ])

    const drawing = this.getDrawingAtCreation(event)
    const drawingEvents =
      (await this.eventService.getActiveEventsInCreationOrder(
        drawing.streamId,
      )) as DrawingEvent[]

    return {
      drawing,
      drawingEvents,
      drawingStreamVersion: event.streamVersion,
    }
  }

  getDrawingAtCreation = (
    creationEvent: AddDrawingToFacilityEvent,
  ): DrawingEntity => {
    if (creationEvent.type !== 'AddDrawingToFacility') {
      throw new Error('First created event is not drawing creation')
    }

    const drawingToCreate: Omit<Drawing, 'facility'> = {
      streamVersion: 1,
      ...creationEvent.eventData,
      currentDate: creationEvent.effectiveDate,
      repayments: [],
      drawnAmount: '0',
      outstandingPrincipal: '0',
    }

    return this.drawingRepo.create(drawingToCreate)
  }

  AdjustFacilityAmount: EventHandler<AdjustFacilityAmountEvent> = async (
    sourceEvent,
    projection,
  ) => {
    const { eventData: incrementEvent } = sourceEvent
    const facilityAmount = Big(projection.facility.facilityAmount)
      .add(incrementEvent.adjustment)
      .toFixed(2)
    const undrawnAmount = Big(projection.facility.undrawnAmount)
      .add(incrementEvent.adjustment)
      .toFixed(2)

    projection.updateFacilityValues({
      facilityAmount,
      undrawnAmount,
    })
    projection.addTransactions({
      streamId: projection.facility.streamId,
      sourceEvent,
      datetime: projection.facility.issuedEffectiveDate,
      reference: 'Facility Amount Updated',
      valueChanged: 'Facility Amount',
      changeInValue: incrementEvent.adjustment,
      valueAfterTransaction: projection.facility.facilityAmount,
    })
  }

  AddFacilityFee: EventHandler<AddFacilityFeeEvent> = async (
    event,
    projection,
  ) => {
    const calculationEvents = this.strategyService.getEventsForFacilityFee(
      projection.facility,
      event.eventData,
    )
    projection.addEvents(calculationEvents)
    projection.addFacilityFee({
      id: event.eventData.feeId,
      balance: '0',
      config: event.eventData,
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
    const { feeId } = sourceEvent.eventData
    const feeBalance = Big(projection.getFacilityFee(feeId).balance ?? '0')
      .add(feeAmount)
      .toFixed(2)

    projection.updateFacilityFeeValue(feeId, feeBalance)
    projection.addTransactions({
      streamId: projection.facility.streamId,
      sourceEvent,
      datetime: sourceEvent.effectiveDate,
      reference: 'Facility fees',
      valueChanged: 'totalFeeBalance',
      changeInValue: feeAmount,
      valueAfterTransaction: projection.facility.facilityFees.find(
        (f) => f.id === feeId,
      )!.balance,
    })
  }

  CalculateFixedFacilityFee = this.CalculateFacilityFee

  CalculateAccruingFacilityFee = this.CalculateFacilityFee
}

export default FacilityEventHandlingService
