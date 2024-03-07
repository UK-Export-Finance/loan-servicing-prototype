/* eslint-disable no-param-reassign */
import { Injectable, Inject } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Propagation, Transactional } from 'typeorm-transactional'
import {
  Transaction,
  DrawingProjectedEvent,
  DrawingEvent,
  CreateNewDrawingEvent,
  SummarisedTransaction,
} from 'loan-servicing-common'
import EventEntity from 'models/entities/EventEntity'
import DrawingTransactionEntity from 'models/entities/FacilityTransactionEntity'
import DrawingEntity from 'models/entities/DrawingEntity'
import EventService from 'modules/event/event.service'
import Big from 'big.js'
import StrategyService from 'modules/strategy/strategy.service'
import DrawingEventHandlingService from './drawing.service.events'

@Injectable()
class DrawingProjectionsService {
  constructor(
    @Inject(EventService) private eventService: EventService,
    @InjectRepository(DrawingTransactionEntity)
    private drawingTransactionRepo: Repository<DrawingTransactionEntity>,
    @InjectRepository(DrawingEntity)
    private drawingRepo: Repository<DrawingEntity>,
    @Inject(StrategyService) private strategyService: StrategyService,
    @Inject(DrawingEventHandlingService)
    private drawingEventHandler: DrawingEventHandlingService,
  ) {}

  @Transactional({ propagation: Propagation.SUPPORTS })
  async getDailyTransactions(streamId: string): Promise<Transaction[] | null> {
    return this.drawingTransactionRepo
      .createQueryBuilder('t')
      .where({ streamId })
      .orderBy({ 't.datetime': 'ASC' })
      .getMany()
  }

  @Transactional({ propagation: Propagation.SUPPORTS })
  async getMonthlyTransactions(
    streamId: string,
  ): Promise<SummarisedTransaction[] | null> {
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
      monthlyInterestAmounts.map<SummarisedTransaction>((a) => ({
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
    transactions: Transaction[]
  }> {
    await this.drawingTransactionRepo.delete({ streamId: drawingStreamId })
    await this.drawingRepo.delete({ streamId: drawingStreamId })

    const drawingEvents = (await this.eventService.getEventsInCreationOrder(
      drawingStreamId,
    )) as DrawingEvent[]

    const drawing = this.getDrawingAtCreation(drawingEvents, facilityId)

    const projectedEvents: DrawingProjectedEvent[] =
      await this.drawingEventHandler.getProjectedEvents(drawing)

    const transactions = this.drawingEventHandler.eventsToTransactions(
      drawing,
      projectedEvents,
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
    transactions: SummarisedTransaction[],
  ): SummarisedTransaction[] {
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
}

export default DrawingProjectionsService
