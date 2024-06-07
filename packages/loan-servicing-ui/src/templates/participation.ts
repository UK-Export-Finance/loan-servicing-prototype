import { Participation } from 'loan-servicing-common'
import { GovUkSummaryListProps } from 'types/nunjucks'
import {
  EventTableProps,
  TransactionTableProps,
} from './macros/transaction-tables'
import { SetDateInputProps } from './macros/dev-set-date'

export type ParticipationNjkInput = {
  facility: Participation
  facilityCreated?: boolean
  facilitySummaryListProps: GovUkSummaryListProps
  drawingSummaries: GovUkSummaryListProps[]
} & EventTableProps &
  TransactionTableProps &
  SetDateInputProps
