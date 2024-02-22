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
  EventBase,
} from 'loan-servicing-common'
import EventEntity from 'models/entities/EventEntity'
import FacilityTransactionEntity from 'models/entities/FacilityTransactionEntity'
import FacilityEntity from 'models/entities/FacilityEntity'
import EventService from 'modules/event/event.service'
import Big, { roundHalfEven as ROUND_MODE_HALF_EVEN } from 'big.js'

type InterestEvent = EventBase<'CalculateInterest', 1, {}>

type FacilityProjectionEvent = Pick<
  InterestEvent | LoanServicingEvent,
  'effectiveDate' | 'eventData' | 'type'
>

const calculateDailyInterest = (
  balance: string,
  interestRate: string,
): Pick<
  FacilityTransaction,
  'transactionAmount' | 'balanceAfterTransaction'
> => {
  const dailyInterestRate = Big(interestRate).div(100).div(365)
  const interestAccrued = Big(balance)
    .times(dailyInterestRate)
    .round(2, ROUND_MODE_HALF_EVEN)
  return {
    transactionAmount: interestAccrued.toString(),
    balanceAfterTransaction: Big(balance).add(interestAccrued).toFixed(2),
  }
}

const applyEventToFacilityAsTransaction = (
  event: FacilityProjectionEvent,
  facilityEntity: FacilityEntity,
): FacilityTransaction => {
  switch (event.type) {
    case 'CreateNewFacility':
      return {
        streamId: facilityEntity.streamId,
        datetime: facilityEntity.issuedEffectiveDate,
        reference: 'Facility Created',
        transactionAmount: facilityEntity.facilityAmount,
        balanceAfterTransaction: facilityEntity.facilityAmount,
      }
    case 'UpdateInterest':
      const { eventData: updateEvent } = event as UpdateInterestEvent
      facilityEntity.interestRate = updateEvent.newInterestRate
      return {
        streamId: facilityEntity.streamId,
        datetime: event.effectiveDate,
        reference: `interest changed from ${facilityEntity.interestRate} to ${updateEvent.newInterestRate}`,
        transactionAmount: '0',
        balanceAfterTransaction: facilityEntity.facilityAmount,
      }
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
        transactionAmount: incrementEvent.adjustment,
        balanceAfterTransaction: facilityEntity.facilityAmount,
      }
    case 'CalculateInterest':
      const { balanceAfterTransaction, transactionAmount } =
        calculateDailyInterest(
          facilityEntity.facilityAmount,
          facilityEntity.interestRate,
        )
      facilityEntity.facilityAmount = balanceAfterTransaction
      return {
        streamId: facilityEntity.streamId,
        datetime: event.effectiveDate,
        reference: 'interest',
        transactionAmount,
        balanceAfterTransaction,
      }
    default:
      throw new NotImplementedException()
  }
}

@Injectable()
class FacilityProjectionsService {
  constructor(
    @Inject(EventService) private eventService: EventService,
    @InjectRepository(FacilityTransactionEntity)
    private facilityTransactionRepo: Repository<FacilityTransactionEntity>,
    @InjectRepository(FacilityEntity)
    private facilityRepo: Repository<FacilityEntity>,
  ) {}

  @Transactional({ propagation: Propagation.SUPPORTS })
  async getTransactions(
    streamId: string,
  ): Promise<FacilityTransactionEntity[] | null> {
    return this.facilityTransactionRepo
      .createQueryBuilder('t')
      .where({ streamId })
      .orderBy({ 't.datetime': 'ASC' })
      .getMany()
  }

  @Transactional()
  async buildProjections(streamId: string): Promise<{
    facility: FacilityEntity
    transactions: FacilityTransactionEntity[]
  }> {
    await this.facilityTransactionRepo.delete({ streamId })

    const facilityEvents =
      await this.eventService.getEventsInCreationOrder(streamId)

    const facility = this.getFacilityAtCreation(facilityEvents)

    const interestEvents = this.generateInterestEvents(facility)

    const projectedEvents: FacilityProjectionEvent[] = [
      ...facilityEvents,
      ...interestEvents,
    ].sort((a, b) => a.effectiveDate.getTime() - b.effectiveDate.getTime())

    const transactions = projectedEvents.map((e) => applyEventToFacilityAsTransaction(e, facility))

    facility.streamVersion =
      facilityEvents[facilityEvents.length - 1].streamVersion

    const transactionEntities =
      await this.facilityTransactionRepo.save(transactions)
    await this.facilityRepo.save(facility)

    return { facility, transactions: transactionEntities }
  }

  getFacilityAtCreation = (
    facilityEvents: EventEntity<LoanServicingEvent>[],
  ): FacilityEntity => {
    const creationEvent =
      facilityEvents[0] as EventEntity<CreateNewFacilityEvent>

    if (creationEvent.type !== 'CreateNewFacility') {
      throw new Error('First effective event is not facility creation')
    }
    return this.facilityRepo.create({
      streamId: creationEvent.streamId,
      streamVersion: 1,
      ...creationEvent.eventData,
    })
  }

  generateInterestEvents = (
    facility: FacilityEntity,
  ): FacilityProjectionEvent[] => {
    const expiryDate = new Date(facility.expiryDate)
    let dateToProcess = new Date(facility.issuedEffectiveDate)
    const interestEvents: FacilityProjectionEvent[] = []
    while (dateToProcess <= expiryDate) {
      interestEvents.push({
        effectiveDate: dateToProcess,
        type: 'CalculateInterest',
        eventData: {},
      })

      dateToProcess = new Date(dateToProcess.getTime() + 24 * 60 * 60000)
    }
    return interestEvents
  }
}

export default FacilityProjectionsService
