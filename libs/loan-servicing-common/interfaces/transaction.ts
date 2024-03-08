import { PartialByKey } from '../utils/type-utils'
import { ProjectedEvent } from './projectedEvents'

export type Transaction = {
  streamId: string
  sourceEvent?: ProjectedEvent
  datetime: Date
  reference: string
  principalChange: string
  interestChange: string
  balanceAfterTransaction: string
  interestAccrued: string
}

export type SummarisedTransaction = PartialByKey<Transaction, 'sourceEvent'>

export type TransactionResolution = 'daily' | 'monthly'
