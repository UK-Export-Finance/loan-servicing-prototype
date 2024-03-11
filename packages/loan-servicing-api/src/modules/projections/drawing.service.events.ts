/* eslint-disable no-param-reassign */
import { Injectable, Inject, NotFoundException } from '@nestjs/common'
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
  sortEventByEffectiveDate,
} from 'loan-servicing-common'
import DrawingEntity from 'models/entities/DrawingEntity'
import EventService from 'modules/event/event.service'
import Big from 'big.js'
import StrategyService from 'modules/strategy/strategy.service'
import {
  EventHandler,
  EventContext,
  IEventHandlerService,
} from 'types/eventHandler'

@Injectable()
class DrawingEventHandlingService
  implements IEventHandlerService<Drawing, DrawingProjectedEvent>
{
  constructor(
    @Inject(EventService) private eventService: EventService,
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
    ].sort(sortEventByEffectiveDate)

    return projectedEvents
  }

  eventsToTransactions = (
    entity: DrawingEntity,
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
          entity,
          transactions,
          sourceEvent,
          eventIndex,
          allEvents,
        }),
      [],
    )

  applyEvent = <T extends DrawingProjectedEvent>(
    eventProps: EventContext<Drawing, T>,
  ): Transaction[] => {
    const mutableTransactions = [...eventProps.transactions]
    const handler = this[eventProps.sourceEvent.type] as EventHandler<
      Drawing,
      T
    >
    return handler(eventProps, mutableTransactions)
  }

  CalculateInterest: EventHandler<Drawing, InterestEvent> = (
    { entity, sourceEvent },
    transactions,
  ) => {
    const transactionAmount = this.strategyService.calculateInterest(entity)
    const totalInterestAfterTransaction = Big(entity.interestAccrued)
      .add(transactionAmount)
      .toFixed(2)
    entity.interestAccrued = totalInterestAfterTransaction
    transactions.push({
      streamId: entity.streamId,
      sourceEvent,
      datetime: sourceEvent.effectiveDate,
      reference: 'interest',
      valueChanged: 'interestAccrued',
      changeInValue: transactionAmount.toString(),
      valueAfterTransaction: entity.interestAccrued,
    })
    return transactions
  }

  UpdateInterest: EventHandler<Drawing, UpdateInterestEvent> = (
    { entity, sourceEvent },
    transactions,
  ) => {
    const { eventData: updateEvent } = sourceEvent
    transactions.push({
      streamId: entity.streamId,
      sourceEvent,
      datetime: sourceEvent.effectiveDate,
      reference: `interest changed from ${entity.interestRate} to ${updateEvent.interestRate}`,
      valueChanged: 'interestRate',
      changeInValue: 'N/A',
      valueAfterTransaction: '0',
    })
    entity.interestRate = updateEvent.interestRate
    return transactions
  }

  CreateNewDrawing: EventHandler<Drawing, CreateNewDrawingEvent> = (
    { entity, sourceEvent },
    transactions,
  ) => {
    transactions.push({
      streamId: entity.streamId,
      sourceEvent,
      datetime: entity.issuedEffectiveDate,
      reference: 'Drawing Created',
      valueChanged: 'N/A',
      changeInValue: '0',
      valueAfterTransaction: '0',
    })
    return transactions
  }

  WithdrawFromDrawing: EventHandler<Drawing, WithdrawFromDrawingEvent> = (
    { entity, sourceEvent },
    transactions,
  ) => {
    const { eventData: drawing } = sourceEvent
    entity.outstandingPrincipal = Big(entity.outstandingPrincipal)
      .add(drawing.amount)
      .toFixed(2)
    entity.facility.drawnAmount = Big(entity.facility.drawnAmount)
      .add(drawing.amount)
      .toFixed(2)
    entity.facility.undrawnAmount = Big(entity.facility.undrawnAmount)
      .sub(drawing.amount)
      .toFixed(2)
    transactions.push({
      streamId: entity.streamId,
      sourceEvent,
      datetime: sourceEvent.effectiveDate,
      reference: `£${drawing.amount} drawn`,
      valueChanged: 'outstandingPrincipal',
      changeInValue: drawing.amount,
      valueAfterTransaction: entity.outstandingPrincipal,
    })
    transactions.push({
      streamId: entity.facilityStreamId,
      sourceEvent,
      datetime: sourceEvent.effectiveDate,
      reference: `£${drawing.amount} drawn on drawing ${entity.streamId}`,
      valueChanged: 'drawnAmount',
      changeInValue: drawing.amount,
      valueAfterTransaction: entity.facility.drawnAmount,
    })
    return transactions
  }

  RevertWithdrawal: EventHandler<Drawing, RevertWithdrawalEvent> = (
    { entity, sourceEvent },
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
    entity.outstandingPrincipal = Big(entity.outstandingPrincipal)
      .sub(withdrawalToRevert.changeInValue)
      .toFixed(2)

    return transactions.filter(
      (t) => t.sourceEvent?.streamVersion !== withdrawalEventStreamVersion,
    )
  }

  Repayment: EventHandler<Drawing, RepaymentsEvent | FinalRepaymentEvent> = (
    { entity, sourceEvent, allEvents, eventIndex },
    transactions,
  ) => {
    const paymentAmount = this.strategyService.calculateRepayment(
      entity,
      sourceEvent,
      allEvents.slice(eventIndex),
    )
    entity.outstandingPrincipal = Big(entity.outstandingPrincipal)
      .minus(paymentAmount)
      .toString()
    transactions.push({
      streamId: entity.streamId,
      sourceEvent,
      datetime: sourceEvent.effectiveDate,
      reference: 'repayment',
      valueChanged: 'outstandingPrincipal',
      changeInValue: Big(paymentAmount).times(-1).toString(),
      valueAfterTransaction: entity.outstandingPrincipal,
    })
    return transactions
  }

  FinalRepayment = this.Repayment
}

export default DrawingEventHandlingService
