import { DrawingDto } from 'loan-servicing-common'
import { GovUkSummaryListProps, NunjuckTableRow } from 'types/nunjucks'
import {
  EventTableProps,
  TransactionTableProps,
} from './macros/transaction-tables'
import { SetDateInputProps } from './macros/dev-set-date'

export type DrawingNjkInput = {
  drawing: DrawingDto
  drawingCreated?: boolean
  drawingSummaryListProps: GovUkSummaryListProps
  withdrawalsSummaryProps: GovUkSummaryListProps
  repaymentsSummaryListProps: GovUkSummaryListProps
  accrualRows: NunjuckTableRow[]
  approvalEvents: NunjuckTableRow[]
} & EventTableProps &
  TransactionTableProps &
  SetDateInputProps
