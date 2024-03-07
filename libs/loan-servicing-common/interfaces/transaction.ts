import { PartialByKey } from '../utils/type-utils'
import { DrawingProjectedEvent } from './projectedEvents/drawing'

export type Transaction = {
  streamId: string
  sourceEvent?: DrawingProjectedEvent
  datetime: Date
  reference: string
  principalChange: string
  interestChange: string
  balanceAfterTransaction: string
  interestAccrued: string
}

export type SummarisedTransaction = PartialByKey<
  Transaction,
  'sourceEvent'
>

export type TransactionResolution = 'daily' | 'monthly'
