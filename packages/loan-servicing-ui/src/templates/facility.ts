import { Facility } from 'loan-servicing-common'
import { GovUkSummaryListProps } from 'types/nunjucks'

export type FacilityNjkInput = {
  facility: Facility
  facilityCreated?: boolean
  eventRows: object
  transactionRows: object
  facilitySummaryListProps: GovUkSummaryListProps
  drawingSummaries: GovUkSummaryListProps[]
}
