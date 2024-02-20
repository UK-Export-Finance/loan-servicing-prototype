import { Injectable, Inject } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import FacilityEntity from 'models/entities/FacilityEntity'
import { Repository } from 'typeorm'
import { Transactional } from 'typeorm-transactional'
import { FacilityTransaction } from 'loan-servicing-common'
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
class FacilityTransactionService {
  constructor(
    @Inject(EventService) private eventService: EventService,
    @InjectRepository(FacilityEntity)
    private facilityRepo: Repository<FacilityEntity>,
  ) {}

  @Transactional()
  async buildTransactions(streamId: string): Promise<void> {
    const facilityEvents = await this.eventService.getEventsInOrder(streamId)
  }
}

export default FacilityTransactionService
