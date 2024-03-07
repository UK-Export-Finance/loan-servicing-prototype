/* eslint-disable no-param-reassign */
import { Injectable, Inject, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import {
  Transaction,
  UpdateInterestEvent,
  Drawing,
  DrawingProjectedEvent,
  WithdrawFromDrawingEvent,
  DrawingEvent,
  CreateNewDrawingEvent,
  RevertWithdrawalEvent,
  InterestEvent,
  RepaymentsEvent,
  FinalRepaymentEvent,
} from 'loan-servicing-common'
import EventEntity from 'models/entities/EventEntity'
import DrawingEntity from 'models/entities/DrawingEntity'
import EventService from 'modules/event/event.service'
import Big from 'big.js'
import StrategyService from 'modules/strategy/strategy.service'
import {
  EventHandler,
  EventHandlerProps,
  IHasEventHandlers,
} from 'types/eventHandler'

@Injectable()
class DrawingEventHandlingService
  implements IHasEventHandlers<DrawingProjectedEvent>
{
  constructor(
    @Inject(EventService) private eventService: EventService,
    @InjectRepository(DrawingEntity)
    private drawingRepo: Repository<DrawingEntity>,
    @Inject(StrategyService) private strategyService: StrategyService,
  ) {}

  getProjectedEvents = async (
    drawing: Drawing,
  ): Promise<DrawingProjectedEvent[]> => {
    const drawingEvents = (await this.eventService.getEventsInCreationOrder(
      drawing.streamId,
    )) as DrawingEvent[]

    const interestEvents = this.strategyService.getInterestEvents(drawing)
    const repaymentEvents = this.strategyService.getRepaymentEvents(drawing)

    const projectedEvents: DrawingProjectedEvent[] = [
      ...drawingEvents,
      ...interestEvents,
      ...repaymentEvents,
    ].sort((a, b) => a.effectiveDate.getTime() - b.effectiveDate.getTime())

    return projectedEvents
  }

  eventsToTransactions = (
    drawingEntity: DrawingEntity,
    events: DrawingProjectedEvent[],
  ): Transaction[] =>
    events.reduce(
      (
        transactions: Transaction[],
        sourceEvent: DrawingProjectedEvent,
        eventIndex: number,
        allEvents: DrawingProjectedEvent[],
      ) =>
        this.applyEvent({
          drawingEntity,
          transactions,
          sourceEvent,
          eventIndex,
          allEvents,
        }),
      [],
    )

  applyEvent = <T extends DrawingProjectedEvent>(
    eventProps: EventHandlerProps<T>,
  ): Transaction[] => {
    const mutableTransactions = [...eventProps.transactions]
    const handler = this[eventProps.sourceEvent.type] as EventHandler<T>
    return handler(eventProps, mutableTransactions)
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

  CalculateInterest: EventHandler<InterestEvent> = (
    { drawingEntity, sourceEvent },
    transactions,
  ) => {
    const transactionAmount =
      this.strategyService.calculateInterest(drawingEntity)
    const totalInterestAfterTransaction = Big(drawingEntity.interestAccrued)
      .add(transactionAmount)
      .toFixed(2)
    drawingEntity.interestAccrued = totalInterestAfterTransaction
    transactions.push({
      streamId: drawingEntity.streamId,
      sourceEvent,
      datetime: sourceEvent.effectiveDate,
      reference: 'interest',
      principalChange: '0',
      interestChange: transactionAmount.toString(),
      balanceAfterTransaction: drawingEntity.outstandingPrincipal,
      interestAccrued: drawingEntity.interestAccrued,
    })
    return transactions
  }

  UpdateInterest: EventHandler<UpdateInterestEvent> = (
    { drawingEntity, sourceEvent },
    transactions,
  ) => {
    const { eventData: updateEvent } = sourceEvent
    transactions.push({
      streamId: drawingEntity.streamId,
      sourceEvent,
      datetime: sourceEvent.effectiveDate,
      reference: `interest changed from ${drawingEntity.interestRate} to ${updateEvent.interestRate}`,
      principalChange: '0',
      interestChange: '0',
      balanceAfterTransaction: drawingEntity.outstandingPrincipal,
      interestAccrued: drawingEntity.interestAccrued,
    })
    drawingEntity.interestRate = updateEvent.interestRate
    return transactions
  }

  CreateNewDrawing: EventHandler<CreateNewDrawingEvent> = (
    { drawingEntity, sourceEvent },
    transactions,
  ) => {
    transactions.push({
      streamId: drawingEntity.streamId,
      sourceEvent,
      datetime: drawingEntity.issuedEffectiveDate,
      reference: 'Drawing Created',
      principalChange: drawingEntity.outstandingPrincipal,
      interestChange: '0',
      balanceAfterTransaction: drawingEntity.outstandingPrincipal,
      interestAccrued: drawingEntity.interestAccrued,
    })
    return transactions
  }

  WithdrawFromDrawing: EventHandler<WithdrawFromDrawingEvent> = (
    { drawingEntity, sourceEvent },
    transactions,
  ) => {
    const { eventData: drawing } = sourceEvent
    drawingEntity.outstandingPrincipal = Big(drawingEntity.outstandingPrincipal)
      .add(drawing.amount)
      .toFixed(2)
    transactions.push({
      streamId: drawingEntity.streamId,
      sourceEvent,
      datetime: sourceEvent.effectiveDate,
      reference: `£${drawing.amount} drawn`,
      principalChange: drawing.amount,
      interestChange: '0',
      balanceAfterTransaction: drawingEntity.outstandingPrincipal,
      interestAccrued: drawingEntity.interestAccrued,
    })
    return transactions
  }

  RevertWithdrawal: EventHandler<RevertWithdrawalEvent> = (
    { drawingEntity, sourceEvent },
    transactions,
  ) => {
    const {
      eventData: { withdrawalEventStreamVersion },
    } = sourceEvent
    const withdrawalToRevert = transactions.find(
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
    drawingEntity.outstandingPrincipal = Big(drawingEntity.outstandingPrincipal)
      .sub(withdrawalToRevert.principalChange)
      .toFixed(2)

    return transactions.filter(
      (t) => t.sourceEvent?.streamVersion !== withdrawalEventStreamVersion,
    )
  }

  Repayment: EventHandler<RepaymentsEvent | FinalRepaymentEvent> = (
    { drawingEntity, sourceEvent, allEvents, eventIndex },
    transactions,
  ) => {
    const paymentAmount = this.strategyService.calculateRepayment(
      drawingEntity,
      sourceEvent,
      allEvents.slice(eventIndex),
    )
    drawingEntity.outstandingPrincipal = Big(drawingEntity.outstandingPrincipal)
      .minus(paymentAmount)
      .toString()
    transactions.push({
      streamId: drawingEntity.streamId,
      sourceEvent,
      datetime: sourceEvent.effectiveDate,
      reference: 'repayment',
      principalChange: Big(paymentAmount).times(-1).toString(),
      interestChange: '0',
      balanceAfterTransaction: drawingEntity.outstandingPrincipal,
      interestAccrued: drawingEntity.interestAccrued,
    })
    return transactions
  }

  FinalRepayment = this.Repayment
}

export default DrawingEventHandlingService
