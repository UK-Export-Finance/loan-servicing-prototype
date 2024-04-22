import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Propagation, Transactional } from 'typeorm-transactional'
import { Transaction, SummarisedTransaction } from 'loan-servicing-common'
import TransactionEntity from 'models/entities/TransactionEntity'
import Big from 'big.js'

@Injectable()
class FacilityTransactionService {
  constructor(
    @InjectRepository(TransactionEntity)
    private transactionRepo: Repository<TransactionEntity>,
  ) {}

  @Transactional({ propagation: Propagation.SUPPORTS })
  async getDailyTransactions(streamId: string): Promise<Transaction[] | null> {
    return this.transactionRepo
      .createQueryBuilder('t')
      .where({ streamId })
      .orderBy({ 't.datetime': 'ASC' })
      .getMany()
  }

  @Transactional({ propagation: Propagation.SUPPORTS })
  async getMonthlyTransactions(
    streamId: string,
  ): Promise<SummarisedTransaction[] | null> {
    // BEWARE: SQL Injection risk - not for production
    const monthlyFees = (await this.transactionRepo.query(
      `SELECT
        YEAR([datetime]) AS 'year',
        MONTH([datetime]) AS 'month',
        SUM([changeInValue]) AS 'facilityFeeChange'
      FROM [dbo].[transaction_entity]
      WHERE [streamId] = '${streamId}'
      AND [valueChanged] = 'totalFeeBalance'
      GROUP BY MONTH([datetime]), YEAR([datetime])`,
    )) as { year: number; month: number; facilityFeeChange: number }[]
    const monthlyFeeTransactions = monthlyFees.map<SummarisedTransaction>(
      (a) => ({
        streamId,
        // We use the first day of the next month for the interest transaction
        // But JS dates are zero indexed so we also subtract 1
        datetime: new Date(a.year, a.month + 1 - 1),
        reference: `Total fees for ${a.month}/${a.year}`,
        valueChanged: 'feeBalance',
        changeInValue: Big(a.facilityFeeChange).toFixed(2),
        valueAfterTransaction: 'TBC',
        status: 'commited',
      }),
    )
    const nonFeeTransactions = await this.transactionRepo
      .createQueryBuilder('t')
      .where({ streamId })
      .andWhere('t.reference != :ref', { ref: 'Facility fees' })
      .orderBy({ 't.datetime': 'ASC' })
      .getMany()
    const summarisedTransactions = [
      ...monthlyFeeTransactions,
      ...nonFeeTransactions,
    ].sort((a, b) => a.datetime.getTime() - b.datetime.getTime())
    return this.setBalancesForSummarisedTransactions(summarisedTransactions)
  }

  setBalancesForSummarisedTransactions(
    transactions: SummarisedTransaction[],
  ): SummarisedTransaction[] {
    let principal = Big(0)
    let interest = Big(0)
    return transactions.map((t) => {
      principal = principal.add(t.changeInValue)
      interest = interest.add(t.changeInValue)
      return {
        ...t,
        balanceAfterTransaction: principal.toString(),
        interestAccrued: interest.toString(),
      }
    })
  }
}

export default FacilityTransactionService
