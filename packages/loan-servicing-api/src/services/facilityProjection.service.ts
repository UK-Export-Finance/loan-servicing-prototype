import { Injectable, Inject, NotImplementedException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Propagation, Transactional } from 'typeorm-transactional'
import {
  CreateNewFacilityEvent,
  FacilityTransaction,
  AdjustFacilityPrincipalEvent,
  UpdateFacilityEvent,
} from 'loan-servicing-common'
import EventEntity from 'models/entities/EventEntity'
import FacilityTransactionEntity from 'models/entities/FacilityTransactionEntity'
import FacilityEntity from 'models/entities/FacilityEntity'
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

@Injectable()
class FacilityProjectionService {
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
  async buildProjection(streamId: string): Promise<{
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

    const transactions: FacilityTransaction[] = []

    const expiryDate = new Date(creationEvent.eventData.expiryDate)
    let dateToProcess = new Date(creationEvent.eventData.issuedEffectiveDate)

    while (dateToProcess <= expiryDate) {
      const interestTransaction = {
        streamId,
        datetime: dateToProcess,
        reference: 'interest',
        ...calculateDailyInterest(
          facilityEntity.facilityAmount,
          facilityEntity.interestRate,
        ),
      }
      transactions.push(interestTransaction)
      facilityEntity.facilityAmount =
        interestTransaction.balanceAfterTransaction

      while (facilityEvents[0]?.effectiveDate < dateToProcess) {
        const event = facilityEvents.shift()!
        switch (event.type) {
          case 'CreateNewFacility':
            transactions.push({
              streamId: facilityEntity.streamId,
              datetime: facilityEntity.issuedEffectiveDate,
              reference: 'Facility Created',
              transactionAmount: facilityEntity.facilityAmount,
              balanceAfterTransaction: facilityEntity.facilityAmount,
            })
            break
          case 'UpdateFacility':
            const { eventData: updateEvent } = event as UpdateFacilityEvent
            if (updateEvent.interestRate) {
              transactions.push({
                streamId,
                datetime: event.effectiveDate,
                reference: `interest changed from ${facilityEntity.interestRate} to ${updateEvent.interestRate}`,
                transactionAmount: 0,
                balanceAfterTransaction: facilityEntity.facilityAmount,
              })
              facilityEntity.interestRate = updateEvent.interestRate
            }
            break
          case 'AdjustFacilityPrincipal':
            const { eventData: incrementEvent } =
              event as AdjustFacilityPrincipalEvent
            transactions.push({
              streamId,
              datetime: event.effectiveDate,
              reference: `facility amount adjustment (withdrawal or repayment)`,
              transactionAmount: incrementEvent.adjustment,
              balanceAfterTransaction:
                facilityEntity.facilityAmount + incrementEvent.adjustment,
            })
            facilityEntity.facilityAmount += incrementEvent.adjustment
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
    await this.facilityRepo.save(facilityEntity)
    return { facility: facilityEntity, transactions: transactionEntities }
  }
}

export default FacilityProjectionService
