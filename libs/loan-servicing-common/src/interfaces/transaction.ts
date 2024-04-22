import { PartialByKey } from '../utils/type-utils'
import { ProjectedEvent } from './projectedEvents'

export type TransactionStatus = 'commited' | 'pendingApproval'

export type Transaction = {
  streamId: string
  sourceEvent?: ProjectedEvent
  datetime: Date
  reference: string
  valueChanged: string
  changeInValue: string
  valueAfterTransaction: string
  status: TransactionStatus
}

export type SummarisedTransaction = PartialByKey<Transaction, 'sourceEvent'>

export type TransactionResolution = 'daily' | 'monthly'
