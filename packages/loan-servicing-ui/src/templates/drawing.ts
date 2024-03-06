import { DrawingDto } from 'loan-servicing-common'
import { GovUkSummaryListProps } from 'types/nunjucks'
import {
  EventTableProps,
  TransactionTableProps,
} from './macros/transaction-tables'

export type DrawingNjkInput = {
  drawing: DrawingDto
  drawingCreated?: boolean
  drawingSummaryListProps: GovUkSummaryListProps
  withdrawalsSummaryProps: GovUkSummaryListProps
} & EventTableProps &
  TransactionTableProps
