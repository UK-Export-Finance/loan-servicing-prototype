import { Injectable, Inject, NotImplementedException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Propagation, Transactional } from 'typeorm-transactional'
import {
  CreateNewFacilityEvent,
  FacilityTransaction,
  IncrementFacilityValueEvent,
  UpdateFacilityEvent,
} from 'loan-servicing-common'
import EventEntity from 'models/entities/EventEntity'
import FacilityTransactionEntity from 'models/entities/FacilityTransactionEntity'
import EventService from './event.service'

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

const createFacilityTransaction = (
  facility: EventEntity<CreateNewFacilityEvent>,
): FacilityTransaction => ({
  streamId: facility.streamId,
  datetime: facility.eventData.issuedEffectiveDate,
  reference: 'Facility Created',
  transactionAmount: facility.eventData.facilityAmount,
  balanceAfterTransaction: facility.eventData.facilityAmount,
})

@Injectable()
class FacilityTransactionService {
  constructor(
    @Inject(EventService) private eventService: EventService,
    @InjectRepository(FacilityTransactionEntity)
    private facilityTransactionRepo: Repository<FacilityTransactionEntity>,
  ) {}

  @Transactional({propagation: Propagation.SUPPORTS})
  async getTransactions(streamId: string): Promise<FacilityTransactionEntity[] | null> {
    return this.facilityTransactionRepo
    .createQueryBuilder('t')
    .where({ streamId })
    .orderBy({ 't.datetime': 'ASC' })
    .getMany()
  }

  @Transactional()
  // Very dodgy, do not use outside of prototype
  async buildTransactions(streamId: string): Promise<void> {
    await this.facilityTransactionRepo.delete({ streamId })

    const facilityEvents =
      await this.eventService.getEventsInEffectiveOrder(streamId)
    const createFacilityEvent =
      facilityEvents.shift() as EventEntity<CreateNewFacilityEvent>

    const transactions = [createFacilityTransaction(createFacilityEvent)]

    const expiryDate = new Date(createFacilityEvent.eventData.expiryDate)
    let dateToProcess = new Date(
      createFacilityEvent.eventData.issuedEffectiveDate,
    )
    let facilityBalance = createFacilityEvent.eventData.facilityAmount
    let facilityInterestRate = createFacilityEvent.eventData.interestRate

    while (dateToProcess <= expiryDate) {
      const interestTransaction = {
        streamId,
        datetime: dateToProcess,
        reference: 'interest',
        ...calculateDailyInterest(facilityBalance, facilityInterestRate),
      }
      transactions.push(interestTransaction)
      facilityBalance = interestTransaction.balanceAfterTransaction

      while (facilityEvents[0]?.effectiveDate < dateToProcess) {
        const event = facilityEvents.shift()!
        switch (event.type) {
          case 'UpdateFacility':
            const { eventData: updateEvent } = event as UpdateFacilityEvent
            if (updateEvent.interestRate) {
              transactions.push({
                streamId,
                datetime: event.effectiveDate,
                reference: `interest changed from ${facilityInterestRate} to ${updateEvent.interestRate}`,
                transactionAmount: 0,
                balanceAfterTransaction: facilityBalance
              })
              facilityInterestRate = updateEvent.interestRate
            }
            break
          case 'IncrementFacilityValue':
            const { eventData: incrementEvent } =
              event as IncrementFacilityValueEvent
            if (incrementEvent.value === 'facilityAmount') {
              transactions.push({
                streamId,
                datetime: event.effectiveDate,
                reference: `facility amount adjustment (withdrawal or repayment)`,
                transactionAmount: incrementEvent.increment,
                balanceAfterTransaction: facilityBalance + incrementEvent.increment
              })
              facilityBalance += incrementEvent.increment
            }
            break
          default:
            throw new NotImplementedException()
        }
      }
      dateToProcess = new Date(dateToProcess.getTime() + 24 * 60 * 60000)
    }

    const transactionEntities =
      await this.facilityTransactionRepo.create(transactions)
    await this.facilityTransactionRepo.save(transactionEntities)
  }
}

export default FacilityTransactionService
