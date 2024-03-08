import { Facility } from 'loan-servicing-common'
import { GovUkSummaryListProps } from 'types/nunjucks'
import {
  EventTableProps,
  TransactionTableProps,
} from './macros/transaction-tables'

export type FacilityNjkInput = {
  facility: Facility
  facilityCreated?: boolean
  facilitySummaryListProps: GovUkSummaryListProps
  drawingSummaries: GovUkSummaryListProps[]
} & EventTableProps &
  TransactionTableProps
