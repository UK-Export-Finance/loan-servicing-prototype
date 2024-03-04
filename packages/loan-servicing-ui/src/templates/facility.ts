import { DrawingDto } from 'loan-servicing-common'
import { GovUkSummaryListProps } from 'types/nunjucks'

export type FacilityNjkInput = {
  facility: DrawingDto
  facilityCreated?: boolean
  eventRows: object
  transactionRows: object
  facilitySummaryListProps: GovUkSummaryListProps
}
