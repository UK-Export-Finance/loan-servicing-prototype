import { PartialByKey } from '../utils/type-utils'
import { ProjectedEvent } from './projectedEvents'

export type Transaction = {
  streamId: string
  sourceEvent?: ProjectedEvent
  datetime: Date
  reference: string
  valueChanged: string
  changeInValue: string
  valueAfterTransaction: string
}

export type SummarisedTransaction = PartialByKey<Transaction, 'sourceEvent'>

export type TransactionResolution = 'daily' | 'monthly'
