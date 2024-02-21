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
import EventService from './event.service'

type InterestEvent = EventBase<'CalculateInterest', 1, {}>

type FacilityProjectionEvent = Pick<
  InterestEvent | LoanServicingEvent,
  'effectiveDate' | 'eventData' | 'type' | 'streamVersion'
>

const calculateDailyInterest = (
  balance: number,
  interestRate: number,
): Pick<
  FacilityTransaction,
  'transactionAmount' | 'balanceAfterTransaction'
> => {
  const interestAccrued = (balance * (interestRate / 100)) / 365
  return {
    transactionAmount: interestAccrued,
    balanceAfterTransaction: balance + interestAccrued,
  }
}

const convertEventToTransaction = (
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
      return {
        streamId: facilityEntity.streamId,
        datetime: event.effectiveDate,
        reference: `interest changed from ${facilityEntity.interestRate} to ${updateEvent.newInterestRate}`,
        transactionAmount: 0,
        balanceAfterTransaction: facilityEntity.facilityAmount,
      }
    case 'AdjustFacilityPrincipal':
      const { eventData: incrementEvent } =
        event as AdjustFacilityPrincipalEvent
      return {
        streamId: facilityEntity.streamId,
        datetime: event.effectiveDate,
        reference: `facility amount adjustment (withdrawal or repayment)`,
        transactionAmount: incrementEvent.adjustment,
        balanceAfterTransaction:
          facilityEntity.facilityAmount,
      }
    case 'CalculateInterest':
      return {
        streamId: facilityEntity.streamId,
        datetime: event.effectiveDate,
        reference: 'interest',
        ...calculateDailyInterest(
          facilityEntity.facilityAmount,
          facilityEntity.interestRate,
        ),
      }
    default:
      throw new NotImplementedException()
  }
}

const applyEventToFacility = (
  event: FacilityProjectionEvent,
  facilityEntity: FacilityEntity,
): void => {
  switch (event.type) {
    case 'CreateNewFacility':
      break
    case 'UpdateInterest':
      const { eventData: updateEvent } = event as UpdateInterestEvent
      facilityEntity.interestRate = updateEvent.newInterestRate
      facilityEntity.streamVersion = event.streamVersion
      break
    case 'AdjustFacilityPrincipal':
      const { eventData: incrementEvent } =
        event as AdjustFacilityPrincipalEvent
      facilityEntity.facilityAmount += incrementEvent.adjustment
      facilityEntity.streamVersion = event.streamVersion
      break
    case 'CalculateInterest':
      facilityEntity.facilityAmount = calculateDailyInterest(
        facilityEntity.facilityAmount,
        facilityEntity.interestRate,
      ).balanceAfterTransaction
      break
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
  // Very dodgy, do not use outside of prototype
  async buildProjections(streamId: string): Promise<{
    facility: FacilityEntity
    transactions: FacilityTransactionEntity[]
  }> {
    await this.facilityTransactionRepo.delete({ streamId })

    const facilityEvents =
      await this.eventService.getEventsInEffectiveOrder(streamId)

    const creationEvent =
      facilityEvents[0] as EventEntity<CreateNewFacilityEvent>

    if (creationEvent.type !== 'CreateNewFacility') {
      throw new Error('First effective event is not facility creation')
    }

    const facilityEntity: FacilityEntity = this.facilityRepo.create({
      streamId,
      streamVersion: 1,
      ...creationEvent.eventData,
    })

    const expiryDate = new Date(creationEvent.eventData.expiryDate)
    let dateToProcess = new Date(creationEvent.eventData.issuedEffectiveDate)
    const interestEvents: FacilityProjectionEvent[] = []
    while (dateToProcess <= expiryDate) {
      interestEvents.push({
        // stream version is not used in the interest event as it is ephemeral
        streamVersion: -1,
        effectiveDate: dateToProcess,
        type: 'CalculateInterest',
        eventData: {},
      })

      dateToProcess = new Date(dateToProcess.getTime() + 24 * 60 * 60000)
    }

    const projectedEvents: FacilityProjectionEvent[] = [
      ...facilityEvents,
      ...interestEvents,
    ].sort((a, b) => a.effectiveDate.getTime() - b.effectiveDate.getTime())

    const transactions = projectedEvents.map((e) => {
      applyEventToFacility(e, facilityEntity)
      return convertEventToTransaction(e, facilityEntity)
    })
    const transactionEntities =
      await this.facilityTransactionRepo.create(transactions)
    await this.facilityTransactionRepo.save(transactionEntities)
    await this.facilityRepo.save(facilityEntity)
    return { facility: facilityEntity, transactions: transactionEntities }
  }
}

export default FacilityProjectionsService
