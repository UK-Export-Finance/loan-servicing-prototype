/* eslint-disable no-param-reassign */
import { Injectable, Inject, NotImplementedException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Propagation, Transactional } from 'typeorm-transactional'
import {
  CreateNewFacilityEvent,
  DrawingTransaction,
  UpdateInterestEvent,
  LoanServicingEvent,
  Drawing,
  DrawingProjectionEvent,
  WithdrawFromDrawingEvent,
  DrawingEvent,
} from 'loan-servicing-common'
import EventEntity from 'models/entities/EventEntity'
import DrawingTransactionEntity from 'models/entities/FacilityTransactionEntity'
import DrawingEntity from 'models/entities/DrawingEntity'
import EventService from 'modules/event/event.service'
import Big from 'big.js'
import StrategyService from 'modules/strategy/strategy.service'

@Injectable()
class DrawingProjectionsService {
  constructor(
    @Inject(EventService) private eventService: EventService,
    @InjectRepository(DrawingTransactionEntity)
    private facilityTransactionRepo: Repository<DrawingTransactionEntity>,
    @InjectRepository(DrawingEntity)
    private facilityRepo: Repository<DrawingEntity>,
    @Inject(StrategyService) private strategyService: StrategyService,
  ) {}

  @Transactional({ propagation: Propagation.SUPPORTS })
  async getDailyTransactions(
    streamId: string,
  ): Promise<DrawingTransaction[] | null> {
    return this.facilityTransactionRepo
      .createQueryBuilder('t')
      .where({ streamId })
      .orderBy({ 't.datetime': 'ASC' })
      .getMany()
  }

  @Transactional({ propagation: Propagation.SUPPORTS })
  async getMonthlyTransactions(
    streamId: string,
  ): Promise<DrawingTransaction[] | null> {
    // BEWARE: SQL Injection risk
    const monthlyInterestAmounts = (await this.facilityTransactionRepo.query(`
      SELECT
        YEAR([datetime]) AS 'year',
        MONTH([datetime]) AS 'month',
        SUM([interestChange]) AS 'interest'
      FROM [LoanServicing].[dbo].[facility_transaction_entity]
      WHERE [streamId] = '${streamId}'
      AND [reference] = 'interest'
      GROUP BY MONTH([datetime]), YEAR([datetime])
    `)) as { year: number; month: number; interest: number }[]
    const monthlyInterestTransactions =
      monthlyInterestAmounts.map<DrawingTransaction>((a) => ({
        streamId,
        // We use the first day of the next month for the interest transaction
        // But JS dates are zero indexed so we also subtract 1
        datetime: new Date(a.year, a.month + 1 - 1),
        reference: `accrued interest for ${a.month}/${a.year}`,
        interestChange: Big(a.interest).toFixed(2),
        principalChange: '0',
        balanceAfterTransaction: '0',
        interestAccrued: '0',
      }))
    const nonInterestTransactions = await this.facilityTransactionRepo
      .createQueryBuilder('t')
      .where({ streamId })
      .andWhere('t.reference != :ref', { ref: 'interest' })
      .orderBy({ 't.datetime': 'ASC' })
      .getMany()
    const summarisedTransactions = [
      ...monthlyInterestTransactions,
      ...nonInterestTransactions,
    ].sort((a, b) => a.datetime.getTime() - b.datetime.getTime())
    return this.setBalancesForSummarisedTransactions(summarisedTransactions)
  }

  @Transactional()
  async buildProjections(drawingStreamId: string): Promise<{
    drawing: Drawing
    transactions: DrawingTransaction[]
  }> {
    await this.facilityTransactionRepo.delete({ streamId: drawingStreamId })

    const facilityEvents = (await this.eventService.getEventsInCreationOrder(
      drawingStreamId,
    )) as DrawingEvent[]

    const facility = this.getFacilityAtCreation(facilityEvents)

    const interestEvents = this.strategyService.getInterestEvents(facility)
    const repaymentEvents = this.strategyService.getRepaymentEvents(facility)

    const projectedEvents: DrawingProjectionEvent[] = [
      ...facilityEvents,
      ...interestEvents,
      ...repaymentEvents,
    ].sort((a, b) => a.effectiveDate.getTime() - b.effectiveDate.getTime())

    const transactions = projectedEvents.map((e, index, allEvents) =>
      this.applyEventToFacilityAsTransaction(e, index, allEvents, facility),
    )

    facility.streamVersion =
      facilityEvents[facilityEvents.length - 1].streamVersion

    const transactionEntities = await this.facilityTransactionRepo.save(
      transactions,
      { chunk: 100 },
    )
    await this.facilityRepo.save(facility)

    return { drawing: facility, transactions: transactionEntities }
  }

  getFacilityAtCreation = (facilityEvents: LoanServicingEvent[]): Drawing => {
    const creationEvent =
      facilityEvents[0] as EventEntity<CreateNewFacilityEvent>

    if (creationEvent.type !== 'CreateNewFacility') {
      throw new Error('First created event is not facility creation')
    }

    return this.facilityRepo.create({
      streamId: creationEvent.streamId,
      streamVersion: 1,
      outstandingPrincipal: '0',
      ...creationEvent.eventData,
    })
  }

  setBalancesForSummarisedTransactions(
    transactions: DrawingTransaction[],
  ): DrawingTransaction[] {
    let principal = Big(0)
    let interest = Big(0)
    return transactions.map((t) => {
      principal = principal.add(t.principalChange)
      interest = interest.add(t.interestChange)
      return {
        ...t,
        balanceAfterTransaction: principal.toString(),
        interestAccrued: interest.toString(),
      }
    })
  }

  applyEventToFacilityAsTransaction = (
    event: DrawingProjectionEvent,
    eventIndex: number,
    allEvents: DrawingProjectionEvent[],
    drawingEntity: Drawing,
  ): DrawingTransaction => {
    switch (event.type) {
      case 'CreateNewDrawing':
        return {
          streamId: drawingEntity.streamId,
          datetime: drawingEntity.issuedEffectiveDate,
          reference: 'Drawing Created',
          principalChange: drawingEntity.outstandingPrincipal,
          interestChange: '0',
          balanceAfterTransaction: drawingEntity.outstandingPrincipal,
          interestAccrued: drawingEntity.interestAccrued,
        }
      case 'UpdateInterest':
        const { eventData: updateEvent } = event as UpdateInterestEvent
        const transaction: DrawingTransaction = {
          streamId: drawingEntity.streamId,
          datetime: event.effectiveDate,
          reference: `interest changed from ${drawingEntity.interestRate} to ${updateEvent.interestRate}`,
          principalChange: '0',
          interestChange: '0',
          balanceAfterTransaction: drawingEntity.outstandingPrincipal,
          interestAccrued: drawingEntity.interestAccrued,
        }
        drawingEntity.interestRate = updateEvent.interestRate
        return transaction
      case 'WithdrawFromDrawingEvent':
        const { eventData: drawing } = event as WithdrawFromDrawingEvent
        drawingEntity.outstandingPrincipal = Big(
          drawingEntity.outstandingPrincipal,
        )
          .add(drawing.amount)
          .toFixed(2)
        return {
          streamId: drawingEntity.streamId,
          datetime: event.effectiveDate,
          reference: `£${drawing.amount} drawn`,
          principalChange: drawing.amount,
          interestChange: '0',
          balanceAfterTransaction: drawingEntity.outstandingPrincipal,
          interestAccrued: drawingEntity.interestAccrued,
        }
      case 'CalculateInterest':
        const transactionAmount =
          this.strategyService.calculateInterest(drawingEntity)
        const totalInterestAfterTransaction = Big(drawingEntity.interestAccrued)
          .add(transactionAmount)
          .toFixed(2)
        drawingEntity.interestAccrued = totalInterestAfterTransaction
        return {
          streamId: drawingEntity.streamId,
          datetime: event.effectiveDate,
          reference: 'interest',
          principalChange: '0',
          interestChange: transactionAmount.toString(),
          balanceAfterTransaction: drawingEntity.outstandingPrincipal,
          interestAccrued: drawingEntity.interestAccrued,
        }
      case 'Repayment':
      case 'FinalRepayment':
        const paymentAmount = this.strategyService.calculateRepayment(
          drawingEntity,
          event,
          allEvents.slice(eventIndex),
        )
        drawingEntity.outstandingPrincipal = Big(
          drawingEntity.outstandingPrincipal,
        )
          .minus(paymentAmount)
          .toString()
        return {
          streamId: drawingEntity.streamId,
          datetime: event.effectiveDate,
          reference: 'repayment',
          principalChange: Big(paymentAmount).times(-1).toString(),
          interestChange: '0',
          balanceAfterTransaction: drawingEntity.outstandingPrincipal,
          interestAccrued: drawingEntity.interestAccrued,
        }
      default:
        throw new NotImplementedException()
    }
  }
}

export default DrawingProjectionsService
