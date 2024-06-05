import { Injectable, Inject } from '@nestjs/common'
import {
  DrawingProjectedEvent,
  WithdrawFromDrawingEvent,
  RevertWithdrawalEvent,
  CreateNewDrawingEvent,
  SetDrawingRepaymentsEvent,
  AddDrawingAccrualEvent,
  CalculateDrawingAccrualEvent,
  RecordDrawingRepaymentEvent,
  Repayment,
  Drawing,
  ForecastRepaymentEvent,
  RecordDrawingAccrualPaymentEvent,
  DrawingAccrual,
} from 'loan-servicing-common'
import Big from 'big.js'
import StrategyService from 'modules/strategy/strategy.service'
import { EventHandler, IEventHandlerService } from 'types/eventHandler'
import PendingEventService, {
  NewPendingEvent,
} from 'modules/pendingEvents/pendingEvent.service'
import FacilityBuilder from 'modules/projections/builders/FacilityBuilder'

@Injectable()
class DrawingEventHandlingService
  implements IEventHandlerService<DrawingProjectedEvent>
{
  constructor(
    @Inject(StrategyService) private strategyService: StrategyService,
    @Inject(PendingEventService)
    private pendingEventService: PendingEventService,
  ) {}

  applyEvent = async <T extends DrawingProjectedEvent>(
    event: T,
    projection: FacilityBuilder,
  ): Promise<void> => {
    const handler = this[event.type] as EventHandler<T>
    await handler(event, projection)
  }

  CreateNewDrawing: EventHandler<CreateNewDrawingEvent> = async (
    sourceEvent,
    projection,
  ) => {
    projection.addTransactions({
      streamId: sourceEvent.streamId,
      sourceEvent,
      datetime: sourceEvent.effectiveDate,
      reference: 'Drawing created',
      valueChanged: 'N/A',
      changeInValue: '0',
      valueAfterTransaction: '0',
      status: 'commited',
    })
  }

  WithdrawFromDrawing: EventHandler<WithdrawFromDrawingEvent> = async (
    sourceEvent,
    projection,
  ) => {
    const drawingBuilder = projection.getDrawingBuilder(sourceEvent.streamId)
    const { drawing } = drawingBuilder
    const { amount: withdrawnAmount } = sourceEvent.eventData

    const drawingOutstandingPrincipal = Big(drawing.outstandingPrincipal)
      .add(withdrawnAmount)
      .toFixed(2)
    const drawingDrawnAmount = Big(drawing.drawnAmount)
      .add(withdrawnAmount)
      .toFixed(2)
    drawingBuilder.updateDrawingValues({
      outstandingPrincipal: drawingOutstandingPrincipal,
      drawnAmount: drawingDrawnAmount,
    })

    const facilityDrawnAmount = Big(projection.facility.drawnAmount)
      .add(withdrawnAmount)
      .toFixed(2)
    const facilityUndrawnAmount = Big(projection.facility.undrawnAmount)
      .sub(withdrawnAmount)
      .toFixed(2)
    projection.updateFacilityValues({
      drawnAmount: facilityDrawnAmount,
      undrawnAmount: facilityUndrawnAmount,
    })

    projection.addTransactions([
      {
        streamId: drawing.streamId,
        sourceEvent,
        datetime: sourceEvent.effectiveDate,
        reference: `£${withdrawnAmount} drawn`,
        valueChanged: 'outstandingPrincipal',
        changeInValue: withdrawnAmount,
        valueAfterTransaction: drawing.outstandingPrincipal,
        status: 'commited',
      },
      {
        streamId: projection.facility.streamId,
        sourceEvent,
        datetime: sourceEvent.effectiveDate,
        reference: `£${withdrawnAmount} drawn on drawing ${drawing.streamId}`,
        valueChanged: 'drawnAmount',
        changeInValue: withdrawnAmount,
        valueAfterTransaction: projection.facility.drawnAmount,
        status: 'commited',
      },
    ])
  }

  AddDrawingAccrual: EventHandler<AddDrawingAccrualEvent> = async (
    event,
    projection,
  ) => {
    const drawingBuilder = projection.getDrawingBuilder(event.streamId)
    const calculationEvents = this.strategyService.getEventsForDrawingAccrual(
      drawingBuilder.drawing,
      event.eventData,
    )
    projection.addEvents(calculationEvents.flatMap((x) => x.events))
    drawingBuilder.addAccruals(calculationEvents.flatMap((x) => x.accrual))
  }

  CalculateDrawingAccrual: EventHandler<CalculateDrawingAccrualEvent> = async (
    sourceEvent,
    projection,
  ) => {
    const drawingBuilder = projection.getDrawingBuilder(sourceEvent.streamId)
    const accruedAmount = this.strategyService.calculateDrawingAccrual(
      drawingBuilder.drawing,
      sourceEvent,
    )
    const { accrualId } = sourceEvent.eventData
    const accrual = drawingBuilder.getAccrual(accrualId)
    const newAccrualValue = Big(accrual.accruedFee ?? '0')
      .add(accruedAmount)
      .toFixed(2)
    drawingBuilder.updateAccrualValue(accrualId, {
      accruedFee: newAccrualValue,
      unpaidAmount: Big(accrual.unpaidAmount).add(accruedAmount).toFixed(2),
    })
    projection.addTransactions({
      streamId: sourceEvent.streamId,
      sourceEvent,
      datetime: sourceEvent.effectiveDate,
      reference: 'Drawing Accrual',
      valueChanged: `accrualBalance:${accrual.id}`,
      changeInValue: accruedAmount,
      valueAfterTransaction: accrual.accruedFee,
      status: 'commited',
    })
  }

  CalculateFixedDrawingAccrual = this.CalculateDrawingAccrual

  CalculateMarketDrawingAccrual = this.CalculateDrawingAccrual

  RecordDrawingAccrualPayment: EventHandler<RecordDrawingAccrualPaymentEvent> =
    async (sourceEvent, projection) => {
      const drawingBuilder = projection.getDrawingBuilder(sourceEvent.streamId)
      const paymentAmount = sourceEvent.eventData.amount
      const { accrualId } = sourceEvent.eventData

      const accrual = drawingBuilder.getAccrual(accrualId)

      const paidAmount = Big(accrual.paidAmount).add(paymentAmount).toFixed(2)
      const isSettled = Big(paidAmount).eq(accrual.accruedFee)
      drawingBuilder.updateAccrualValue(accrualId, {
        paidAmount,
        isSettled,
        unpaidAmount: Big(accrual.unpaidAmount).sub(paidAmount).toFixed(2),
      })

      projection.addTransactions({
        streamId: sourceEvent.streamId,
        sourceEvent,
        datetime: sourceEvent.effectiveDate,
        reference: 'accrual fee payment',
        valueChanged: 'accrualFeeBalance',
        changeInValue: Big(paymentAmount).times(-1).toString(),
        valueAfterTransaction: '0',
        status: 'commited',
      })
    }

  RevertWithdrawal: EventHandler<RevertWithdrawalEvent> = async () => {
    // const drawingBuilder = projection.getDrawingBuilder(sourceEvent.streamId)
    // const {
    //   eventData: { withdrawalEventStreamVersion },
    // } = sourceEvent
    // const withdrawalToRevert = projection.getTransactionByStreamVersion(
    //   withdrawalEventStreamVersion,
    // )
    // if (withdrawalToRevert?.sourceEvent?.type !== 'WithdrawFromDrawing') {
    //   throw new NotFoundException(
    //     `Withdrawal not found for at stream version ${withdrawalEventStreamVersion}`,
    //   )
    // }
    // const drawingOutstandingPrincipal = Big(
    //   drawingBuilder.drawing.outstandingPrincipal,
    // )
    //   .sub(withdrawalToRevert.changeInValue)
    //   .toFixed(2)
    // drawingBuilder.updateDrawingValues({
    //   outstandingPrincipal: drawingOutstandingPrincipal,
    // })
    // const facilityDrawnAmount = Big(drawingBuilder.projection.facility.drawnAmount)
    //   .sub(withdrawalToRevert.changeInValue)
    //   .toFixed(2)
    // const facilityUndrawnAmount = Big(
    //   drawingBuilder.projection.facility.undrawnAmount,
    // )
    //   .add(withdrawalToRevert.changeInValue)
    //   .toFixed(2)
    // projection.updateFacilityValues({
    //   drawnAmount: facilityDrawnAmount,
    //   undrawnAmount: facilityUndrawnAmount,
    // })
    // projection.transactions = projection.transactions.filter(
    //   (t) => t.sourceEvent?.streamVersion !== withdrawalEventStreamVersion,
    // )
  }

  async addPendingRepayments(
    repayments: Repayment[],
    drawing: Drawing,
  ): Promise<void> {
    const repaymentEvents = repayments.flatMap<
      NewPendingEvent<RecordDrawingRepaymentEvent>
    >((r) => ({
      effectiveDate: new Date(),
      dueDate: r.date,
      notificationDate: new Date(r.date.getTime() - 1000 * 60 * 60 * 24 * 7),
      entityType: 'drawing',
      type: 'RecordDrawingRepayment',
      typeVersion: 1,
      shouldProcessIfFuture: false,
      streamId: drawing.streamId,
      eventData: { repaymentId: r.id, amount: r.expectedAmount },
    }))
    await this.pendingEventService.addPendingEvents(repaymentEvents)
  }

  async addPendingAccrualPayments(
    accruals: DrawingAccrual[],
    drawing: Drawing,
  ): Promise<void> {
    const repaymentEvents = accruals.map<
      NewPendingEvent<RecordDrawingAccrualPaymentEvent>
    >((r) => ({
      effectiveDate: new Date(),
      dueDate: r.config.expiryDate,
      notificationDate: new Date(
        r.config.expiryDate.getTime() - 1000 * 60 * 60 * 24 * 7,
      ),
      entityType: 'drawing',
      type: 'RecordDrawingAccrualPayment',
      typeVersion: 1,
      shouldProcessIfFuture: false,
      streamId: drawing.streamId,
      eventData: { accrualId: r.id, amount: r.predictedFinalFee },
    }))
    await this.pendingEventService.addPendingEvents(repaymentEvents)
  }

  SetDrawingRepayments: EventHandler<SetDrawingRepaymentsEvent> = async (
    event,
    projection,
  ) => {
    const drawingBuilder = projection.getDrawingBuilder(event.streamId)
    const repayments = this.strategyService.getRepayments(
      drawingBuilder.drawing,
      event.eventData,
    )
    drawingBuilder.setRepayments(repayments)

    const forecastEvents = repayments.map<ForecastRepaymentEvent>((r) => ({
      streamId: event.streamId,
      effectiveDate: r.date,
      entityType: 'drawing',
      shouldProcessIfFuture: false,
      eventData: { repaymentId: r.id, amount: r.expectedAmount },
      type: 'ForecastDrawingRepayment',
      isApproved: false,
    }))
    projection.addEvents(forecastEvents)
  }

  ProcessDrawingRepayment: EventHandler<
    RecordDrawingRepaymentEvent | ForecastRepaymentEvent
  > = async (sourceEvent, projection) => {
    const drawingBuilder = projection.getDrawingBuilder(sourceEvent.streamId)
    const paymentAmount = sourceEvent.eventData.amount
    const { repaymentId } = sourceEvent.eventData

    const outstandingPrincipal = Big(
      drawingBuilder.drawing.outstandingPrincipal,
    )
      .minus(paymentAmount)
      .toString()
    drawingBuilder.updateDrawingValues({ outstandingPrincipal })

    const repayment = drawingBuilder.getRepayment(repaymentId)

    const paidAmount = Big(repayment.paidAmount).add(paymentAmount).toFixed(2)
    const settled = Big(paidAmount).eq(repayment.expectedAmount)
    drawingBuilder.updateRepaymentValue(repaymentId, { paidAmount, settled })

    projection.addTransactions({
      streamId: sourceEvent.streamId,
      sourceEvent,
      datetime: sourceEvent.effectiveDate,
      reference: 'repayment',
      valueChanged: 'outstandingPrincipal',
      changeInValue: Big(paymentAmount).times(-1).toString(),
      valueAfterTransaction: outstandingPrincipal,
      status: sourceEvent.isApproved ? 'commited' : 'pendingApproval',
    })
  }

  RecordDrawingRepayment: EventHandler<RecordDrawingRepaymentEvent> =
    this.ProcessDrawingRepayment

  ForecastDrawingRepayment: EventHandler<ForecastRepaymentEvent> = async (
    event,
    projection,
  ) => {
    if (event.effectiveDate > projection.projectionDate) {
      await this.ProcessDrawingRepayment(event, projection)
    }
  }
}

export default DrawingEventHandlingService
