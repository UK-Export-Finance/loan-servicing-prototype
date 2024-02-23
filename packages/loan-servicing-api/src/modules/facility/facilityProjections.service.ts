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
  Facility,
} from 'loan-servicing-common'
import EventEntity from 'models/entities/EventEntity'
import FacilityTransactionEntity from 'models/entities/FacilityTransactionEntity'
import FacilityEntity from 'models/entities/FacilityEntity'
import EventService from 'modules/event/event.service'
import Big from 'big.js'
import StrategyService from 'modules/strategy/strategy.service'

type InterestEvent = EventBase<'CalculateInterest', 1, {}>

type FacilityProjectionEvent = Pick<
  InterestEvent | LoanServicingEvent,
  'effectiveDate' | 'eventData' | 'type'
>

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
  async getTransactions(
    streamId: string,
  ): Promise<FacilityTransaction[] | null> {
    return this.facilityTransactionRepo
      .createQueryBuilder('t')
      .where({ streamId })
      .orderBy({ 't.datetime': 'ASC' })
      .getMany()
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

    const interestEvents = this.generateInterestEvents(facility)

    const projectedEvents: FacilityProjectionEvent[] = [
      ...facilityEvents,
      ...interestEvents,
    ].sort((a, b) => a.effectiveDate.getTime() - b.effectiveDate.getTime())

    const transactions = projectedEvents.map((e) =>
      this.applyEventToFacilityAsTransaction(e, facility),
    )

    facility.streamVersion =
      facilityEvents[facilityEvents.length - 1].streamVersion

    const transactionEntities =
      await this.facilityTransactionRepo.save(transactions)
    await this.facilityRepo.save(facility)

    return { facility, transactions: transactionEntities }
  }

  getFacilityAtCreation = (
    facilityEvents: LoanServicingEvent[],
  ): Facility => {
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

  generateInterestEvents = (
    facility: Facility,
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
      // Naive date management - not suitable for production
      dateToProcess = new Date(dateToProcess.getTime() + 24 * 60 * 60000)
    }
    return interestEvents
  }

  applyEventToFacilityAsTransaction = (
    event: FacilityProjectionEvent,
    facilityEntity: Facility,
  ): FacilityTransaction => {
    switch (event.type) {
      case 'CreateNewFacility':
        return {
          streamId: facilityEntity.streamId,
          datetime: facilityEntity.issuedEffectiveDate,
          reference: 'Facility Created',
          transactionAmount: facilityEntity.facilityAmount,
          balanceAfterTransaction: facilityEntity.facilityAmount,
          interestAccrued: facilityEntity.interestAccrued,
        }
      case 'UpdateInterest':
        const { eventData: updateEvent } = event as UpdateInterestEvent
        const transaction = {
          streamId: facilityEntity.streamId,
          datetime: event.effectiveDate,
          reference: `interest changed from ${facilityEntity.interestRate} to ${updateEvent.interestRate}`,
          transactionAmount: '0',
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
          transactionAmount: incrementEvent.adjustment,
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
          transactionAmount: transactionAmount.toString(),
          balanceAfterTransaction: facilityEntity.facilityAmount,
          interestAccrued: facilityEntity.interestAccrued,
        }
      default:
        throw new NotImplementedException()
    }
  }
}

export default FacilityProjectionsService
