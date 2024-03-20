/* eslint-disable no-param-reassign */
import { Injectable, Inject, NotFoundException } from '@nestjs/common'
import {
  DrawingProjectedEvent,
  WithdrawFromDrawingEvent,
  RevertWithdrawalEvent,
  RepaymentsEvent,
  CreateNewDrawingEvent,
  SetDrawingRepaymentsEvent,
  AddDrawingAccrualEvent,
  CalculateDrawingAccrualEvent,
} from 'loan-servicing-common'
import Big from 'big.js'
import StrategyService from 'modules/strategy/strategy.service'
import { EventHandler, IEventHandlerService } from 'types/eventHandler'
import FacilityProjection from './projection'

@Injectable()
class DrawingEventHandlingService
  implements IEventHandlerService<DrawingProjectedEvent>
{
  constructor(
    @Inject(StrategyService) private strategyService: StrategyService,
  ) {}

  applyEvent = async <T extends DrawingProjectedEvent>(
    event: T,
    projection: FacilityProjection,
  ): Promise<void> => {
    const handler = this[event.type] as EventHandler<T>
    await handler(event, projection)
  }

  CreateNewDrawing: EventHandler<CreateNewDrawingEvent> = async (
    sourceEvent,
    projection,
  ) => {
    projection.transactions.push({
      streamId: sourceEvent.streamId,
      sourceEvent,
      datetime: sourceEvent.effectiveDate,
      reference: 'Drawing created',
      valueChanged: 'N/A',
      changeInValue: '0',
      valueAfterTransaction: '0',
    })
  }

  WithdrawFromDrawing: EventHandler<WithdrawFromDrawingEvent> = async (
    sourceEvent,
    projection,
  ) => {
    const drawing = projection.getDrawing(sourceEvent.streamId)
    const { amount: withdrawnAmount } = sourceEvent.eventData
    drawing.outstandingPrincipal = Big(drawing.outstandingPrincipal)
      .add(withdrawnAmount)
      .toFixed(2)
    drawing.drawnAmount = Big(drawing.drawnAmount)
      .add(withdrawnAmount)
      .toFixed(2)
    drawing.facility.drawnAmount = Big(drawing.facility.drawnAmount)
      .add(withdrawnAmount)
      .toFixed(2)
    drawing.facility.undrawnAmount = Big(drawing.facility.undrawnAmount)
      .sub(withdrawnAmount)
      .toFixed(2)
    projection.transactions.push({
      streamId: drawing.streamId,
      sourceEvent,
      datetime: sourceEvent.effectiveDate,
      reference: `£${withdrawnAmount} drawn`,
      valueChanged: 'outstandingPrincipal',
      changeInValue: withdrawnAmount,
      valueAfterTransaction: drawing.outstandingPrincipal,
    })
    projection.transactions.push({
      streamId: drawing.facility.streamId,
      sourceEvent,
      datetime: sourceEvent.effectiveDate,
      reference: `£${withdrawnAmount} drawn on drawing ${drawing.streamId}`,
      valueChanged: 'drawnAmount',
      changeInValue: withdrawnAmount,
      valueAfterTransaction: drawing.facility.drawnAmount,
    })
  }

  AddDrawingAccrual: EventHandler<AddDrawingAccrualEvent> = async (
    event,
    projection,
  ) => {
    const drawing = projection.getDrawing(event.streamId)
    const calculationEvents = this.strategyService.getEventsForDrawingAccrual(
      drawing,
      event.eventData,
    )
    projection.addEvents(calculationEvents)
    drawing.accruals.push({
      id: event.eventData.accrualId,
      balance: '0',
      config: event.eventData,
    })
  }

  CalculateFacilityFee: EventHandler<CalculateDrawingAccrualEvent> = async (
    sourceEvent,
    projection,
  ) => {
    const drawing = projection.getDrawing(sourceEvent.streamId)
    const accruedAmount = this.strategyService.calculateDrawingAccrual(
      drawing,
      sourceEvent,
    )
    const { accrualId } = sourceEvent.eventData
    const accrual = drawing.accruals.find((f) => f.id === accrualId)!
    accrual.balance = Big(accrual.balance ?? '0')
      .add(accruedAmount)
      .toFixed(2)
    projection.transactions.push({
      streamId: drawing.streamId,
      sourceEvent,
      datetime: sourceEvent.effectiveDate,
      reference: 'Drawing Accrual',
      valueChanged: `accrualBalance:${accrual.id}`,
      changeInValue: accruedAmount,
      valueAfterTransaction: accrual.balance,
    })
  }

  CalculateFixedDrawingAccrual = this.CalculateFacilityFee

  CalculateMarketDrawingAccrual = this.CalculateFacilityFee

  RevertWithdrawal: EventHandler<RevertWithdrawalEvent> = async (
    sourceEvent,
    projection,
  ) => {
    const drawing = projection.getDrawing(sourceEvent.streamId)
    const {
      eventData: { withdrawalEventStreamVersion },
    } = sourceEvent
    const withdrawalToRevert = projection.transactions.find(
      (t) => t.sourceEvent?.streamVersion === withdrawalEventStreamVersion,
    )
    if (
      !withdrawalToRevert ||
      withdrawalToRevert.sourceEvent?.type !== 'WithdrawFromDrawing'
    ) {
      throw new NotFoundException(
        `Withdrawal not found for at stream version ${withdrawalEventStreamVersion}`,
      )
    }
    drawing.outstandingPrincipal = Big(drawing.outstandingPrincipal)
      .sub(withdrawalToRevert.changeInValue)
      .toFixed(2)
    drawing.facility.drawnAmount = Big(drawing.facility.drawnAmount)
      .sub(withdrawalToRevert.changeInValue)
      .toFixed(2)
    drawing.facility.undrawnAmount = Big(drawing.facility.undrawnAmount)
      .add(withdrawalToRevert.changeInValue)
      .toFixed(2)
    projection.transactions = projection.transactions.filter(
      (t) => t.sourceEvent?.streamVersion !== withdrawalEventStreamVersion,
    )
  }

  SetDrawingRepayments: EventHandler<SetDrawingRepaymentsEvent> = async (
    event,
    projection,
  ) => {
    const drawing = projection.getDrawing(event.streamId)
    const repaymentEvents = this.strategyService.getRepaymentEvents(
      drawing,
      event.eventData,
    )
    // projection.addEvents(repaymentEvents)
    drawing.repayments = repaymentEvents.map((e, i) => ({
      date: e.effectiveDate,
      amount: e.eventData.amount,
      id: `${event.streamId}-repayment-${i + 1}`,
      received: false,
    }))
    drawing.drawingConfig.repaymentsStrategy = event.eventData
  }

  Repayment: EventHandler<RepaymentsEvent> = async (
    sourceEvent,
    projection,
  ) => {
    const drawing = projection.getDrawing(sourceEvent.streamId)
    const paymentAmount = this.strategyService.calculateRepayment(
      drawing,
      sourceEvent,
      projection.getRemainingEvents(),
    )
    drawing.outstandingPrincipal = Big(drawing.outstandingPrincipal)
      .minus(paymentAmount)
      .toString()
    projection.transactions.push({
      streamId: drawing.streamId,
      sourceEvent,
      datetime: sourceEvent.effectiveDate,
      reference: 'repayment',
      valueChanged: 'outstandingPrincipal',
      changeInValue: Big(paymentAmount).times(-1).toString(),
      valueAfterTransaction: drawing.outstandingPrincipal,
    })
  }

  ManualRepayment = this.Repayment

  RegularRepayment = this.Repayment
}

export default DrawingEventHandlingService
