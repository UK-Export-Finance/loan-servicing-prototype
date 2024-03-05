/* eslint-disable no-param-reassign */
import { Injectable, Inject, NotImplementedException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Propagation, Transactional } from 'typeorm-transactional'
import {
  DrawingTransaction,
  UpdateInterestEvent,
  Drawing,
  DrawingProjectionEvent,
  WithdrawFromDrawingEvent,
  DrawingEvent,
  CreateNewDrawingEvent,
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
    private drawingTransactionRepo: Repository<DrawingTransactionEntity>,
    @InjectRepository(DrawingEntity)
    private drawingRepo: Repository<DrawingEntity>,
    @Inject(StrategyService) private strategyService: StrategyService,
  ) {}

  @Transactional({ propagation: Propagation.SUPPORTS })
  async getDailyTransactions(
    streamId: string,
  ): Promise<DrawingTransaction[] | null> {
    return this.drawingTransactionRepo
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
    const monthlyInterestAmounts = (await this.drawingTransactionRepo.query(`
      SELECT
        YEAR([datetime]) AS 'year',
        MONTH([datetime]) AS 'month',
        SUM([interestChange]) AS 'interest'
      FROM [LoanServicing].[dbo].[drawing_transaction_entity]
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
    const nonInterestTransactions = await this.drawingTransactionRepo
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
  async buildProjections(
    facilityId: string,
    drawingStreamId: string,
  ): Promise<{
    drawing: DrawingEntity
    transactions: DrawingTransaction[]
  }> {
    await this.drawingTransactionRepo.delete({ streamId: drawingStreamId })
    await this.drawingRepo.delete({ streamId: drawingStreamId })

    const drawingEvents = (await this.eventService.getEventsInCreationOrder(
      drawingStreamId,
    )) as DrawingEvent[]

    const drawing = this.getDrawingAtCreation(drawingEvents, facilityId)

    const interestEvents = this.strategyService.getInterestEvents(drawing)
    const repaymentEvents = this.strategyService.getRepaymentEvents(drawing)

    const projectedEvents: DrawingProjectionEvent[] = [
      ...drawingEvents,
      ...interestEvents,
      ...repaymentEvents,
    ].sort((a, b) => a.effectiveDate.getTime() - b.effectiveDate.getTime())

    const transactions = projectedEvents.map((e, index, allEvents) =>
      this.applyEventToFacilityAsTransaction(e, index, allEvents, drawing),
    )

    drawing.streamVersion =
      drawingEvents[drawingEvents.length - 1].streamVersion
    drawing.facilityStreamId = facilityId

    const transactionEntities = await this.drawingTransactionRepo.save(
      transactions,
      { chunk: 100 },
    )
    await this.drawingRepo.save(drawing)

    return { drawing, transactions: transactionEntities }
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
      case 'WithdrawFromDrawing':
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
