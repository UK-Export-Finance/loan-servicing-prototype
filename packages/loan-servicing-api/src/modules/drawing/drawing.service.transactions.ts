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
    private drawingTransactionRepo: Repository<TransactionEntity>,
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
    // BEWARE: SQL Injection risk - not for production
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

export default DrawingTransactionService
