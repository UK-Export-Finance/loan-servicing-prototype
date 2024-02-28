/* eslint-disable no-param-reassign */
import { Injectable, Inject, NotImplementedException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Propagation, Transactional } from 'typeorm-transactional'
import {
  CreateNewFacilityEvent,
  FacilityTransaction,
  AdjustFacilityPrincipalEvent,
  UpdateInterestEvent,
  LoanServicingEvent,
  Facility,
  FacilityProjectionEvent,
} from 'loan-servicing-common'
import EventEntity from 'models/entities/EventEntity'
import FacilityTransactionEntity from 'models/entities/FacilityTransactionEntity'
import FacilityEntity from 'models/entities/FacilityEntity'
import EventService from 'modules/event/event.service'
import Big from 'big.js'
import StrategyService from 'modules/strategy/strategy.service'

@Injectable()
class FacilityProjectionsService {
  constructor(
    @Inject(EventService) private eventService: EventService,
    @InjectRepository(FacilityTransactionEntity)
    private facilityTransactionRepo: Repository<FacilityTransactionEntity>,
    @InjectRepository(FacilityEntity)
    private facilityRepo: Repository<FacilityEntity>,
    @Inject(StrategyService) private strategyService: StrategyService,
  ) {}

  @Transactional({ propagation: Propagation.SUPPORTS })
  async getDailyTransactions(
    streamId: string,
  ): Promise<FacilityTransaction[] | null> {
    return this.facilityTransactionRepo
      .createQueryBuilder('t')
      .where({ streamId })
      .orderBy({ 't.datetime': 'ASC' })
      .getMany()
  }

  @Transactional({ propagation: Propagation.SUPPORTS })
  async getMonthlyTransactions(
    streamId: string,
  ): Promise<FacilityTransaction[] | null> {
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
      monthlyInterestAmounts.map<FacilityTransaction>((a) => ({
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
  async buildProjections(streamId: string): Promise<{
    facility: Facility
    transactions: FacilityTransaction[]
  }> {
    await this.facilityTransactionRepo.delete({ streamId })

    const facilityEvents =
      await this.eventService.getEventsInCreationOrder(streamId)

    const facility = this.getFacilityAtCreation(facilityEvents)

    const interestEvents = this.strategyService.getInterestEvents(facility)
    const repaymentEvents = this.strategyService.getRepaymentEvents(
      facility,
      6,
      3,
    )

    const projectedEvents: FacilityProjectionEvent[] = [
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

    return { facility, transactions: transactionEntities }
  }

  getFacilityAtCreation = (facilityEvents: LoanServicingEvent[]): Facility => {
    const creationEvent =
      facilityEvents[0] as EventEntity<CreateNewFacilityEvent>

    if (creationEvent.type !== 'CreateNewFacility') {
      throw new Error('First created event is not facility creation')
    }
    return this.facilityRepo.create({
      streamId: creationEvent.streamId,
      streamVersion: 1,
      ...creationEvent.eventData,
    })
  }

  setBalancesForSummarisedTransactions(
    transactions: FacilityTransaction[],
  ): FacilityTransaction[] {
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
    event: FacilityProjectionEvent,
    eventIndex: number,
    allEvents: FacilityProjectionEvent[],
    facilityEntity: Facility,
  ): FacilityTransaction => {
    switch (event.type) {
      case 'CreateNewFacility':
        return {
          streamId: facilityEntity.streamId,
          datetime: facilityEntity.issuedEffectiveDate,
          reference: 'Facility Created',
          principalChange: facilityEntity.facilityAmount,
          interestChange: '0',
          balanceAfterTransaction: facilityEntity.facilityAmount,
          interestAccrued: facilityEntity.interestAccrued,
        }
      case 'UpdateInterest':
        const { eventData: updateEvent } = event as UpdateInterestEvent
        const transaction: FacilityTransaction = {
          streamId: facilityEntity.streamId,
          datetime: event.effectiveDate,
          reference: `interest changed from ${facilityEntity.interestRate} to ${updateEvent.interestRate}`,
          principalChange: '0',
          interestChange: '0',
          balanceAfterTransaction: facilityEntity.facilityAmount,
          interestAccrued: facilityEntity.interestAccrued,
        }
        facilityEntity.interestRate = updateEvent.interestRate
        return transaction
      case 'AdjustFacilityPrincipal':
        const { eventData: incrementEvent } =
          event as AdjustFacilityPrincipalEvent
        facilityEntity.facilityAmount = Big(facilityEntity.facilityAmount)
          .add(incrementEvent.adjustment)
          .toFixed(2)
        return {
          streamId: facilityEntity.streamId,
          datetime: event.effectiveDate,
          reference: `facility amount adjustment (withdrawal or repayment)`,
          principalChange: incrementEvent.adjustment,
          interestChange: '0',
          balanceAfterTransaction: facilityEntity.facilityAmount,
          interestAccrued: facilityEntity.interestAccrued,
        }
      case 'CalculateInterest':
        const transactionAmount =
          this.strategyService.calculateInterest(facilityEntity)
        const totalInterestAfterTransaction = Big(
          facilityEntity.interestAccrued,
        )
          .add(transactionAmount)
          .toFixed(2)
        facilityEntity.interestAccrued = totalInterestAfterTransaction
        return {
          streamId: facilityEntity.streamId,
          datetime: event.effectiveDate,
          reference: 'interest',
          principalChange: '0',
          interestChange: transactionAmount.toString(),
          balanceAfterTransaction: facilityEntity.facilityAmount,
          interestAccrued: facilityEntity.interestAccrued,
        }
      case 'Repayment':
      case 'FinalRepayment':
        const paymentAmount = this.strategyService.calculateRepayment(
          facilityEntity,
          event,
          allEvents.slice(eventIndex),
        )
        facilityEntity.facilityAmount = Big(facilityEntity.facilityAmount)
          .minus(paymentAmount)
          .toString()
        return {
          streamId: facilityEntity.streamId,
          datetime: event.effectiveDate,
          reference: 'repayment',
          principalChange: Big(paymentAmount).times(-1).toString(),
          interestChange: '0',
          balanceAfterTransaction: facilityEntity.facilityAmount,
          interestAccrued: facilityEntity.interestAccrued,
        }
      default:
        throw new NotImplementedException()
    }
  }
}

export default FacilityProjectionsService
