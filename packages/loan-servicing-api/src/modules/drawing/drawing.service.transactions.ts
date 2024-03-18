/* eslint-disable no-param-reassign */
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Propagation, Transactional } from 'typeorm-transactional'
import { Transaction, SummarisedTransaction } from 'loan-servicing-common'
import TransactionEntity from 'models/entities/TransactionEntity'
import Big from 'big.js'

@Injectable()
class DrawingTransactionService {
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
    const monthlyInterestAmounts = (await this.transactionRepo.query(
      ` SELECT
          YEAR([datetime]) AS 'year',
          MONTH([datetime]) AS 'month',
          SUM([changeInValue]) AS 'interest'
        FROM [dbo].[transaction_entity]
        WHERE [streamId] = '${streamId}'
        AND [valueChanged] = 'interestAccrued'
        GROUP BY MONTH([datetime]), YEAR([datetime])
      `,
    )) as { year: number; month: number; interest: number }[]
    const monthlyInterestTransactions =
      monthlyInterestAmounts.map<SummarisedTransaction>((a) => ({
        streamId,
        // We use the first day of the next month for the interest transaction
        // But JS dates are zero indexed so we also subtract 1
        datetime: new Date(a.year, a.month + 1 - 1),
        reference: `accrued interest for ${a.month}/${a.year}`,
        valueChanged: 'interestAccrued',
        changeInValue: Big(a.interest).toFixed(2),
        valueAfterTransaction: 'TBC',
      }))
    const monthlyAccrualAmounts = (await this.transactionRepo.query(
      ` SELECT
            YEAR([datetime]) AS 'year',
            MONTH([datetime]) AS 'month',
            SUM([changeInValue]) AS 'accrued'
          FROM [dbo].[transaction_entity]
          WHERE [streamId] = '${streamId}'
          AND [reference] = 'Drawing Accrual'
          GROUP BY MONTH([datetime]), YEAR([datetime])
        `,
    )) as { year: number; month: number; accrued: number }[]
    const monthlyAccrualTransactions =
      monthlyAccrualAmounts.map<SummarisedTransaction>((a) => ({
        streamId,
        // We use the first day of the next month for the interest transaction
        // But JS dates are zero indexed so we also subtract 1
        datetime: new Date(a.year, a.month + 1 - 1),
        reference: `total accruals for ${a.month}/${a.year}`,
        valueChanged: 'accrualTotal',
        changeInValue: Big(a.accrued).toFixed(2),
        valueAfterTransaction: 'TBC',
      }))
    const nonSummarisedTransactions = await this.transactionRepo
      .createQueryBuilder('t')
      .where({ streamId })
      .andWhere("t.reference != 'interest'")
      .andWhere("t.reference != 'Drawing Accrual'")
      .orderBy({ 't.datetime': 'ASC' })
      .getMany()
    const summarisedTransactions = [
      ...monthlyInterestTransactions,
      ...monthlyAccrualTransactions,
      ...nonSummarisedTransactions,
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

export default DrawingTransactionService
