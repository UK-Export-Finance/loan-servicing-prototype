import { PartialByKey } from '../utils/type-utils'
import { DrawingProjectionEvent } from './projectedEvents'

export type DrawingTransaction = {
  streamId: string
  sourceEvent?: DrawingProjectionEvent
  datetime: Date
  reference: string
  principalChange: string
  interestChange: string
  balanceAfterTransaction: string
  interestAccrued: string
}

export type SummarisedTransaction = PartialByKey<
  DrawingTransaction,
  'sourceEvent'
>

export type TransactionResolution = 'daily' | 'monthly'
