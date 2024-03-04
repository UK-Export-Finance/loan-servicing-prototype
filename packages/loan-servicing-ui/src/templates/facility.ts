import { FacilityDto } from 'loan-servicing-common'
import { GovUkSummaryListProps } from 'types/nunjucks'

export type FacilityNjkInput = {
  facility: FacilityDto
  facilityCreated?: boolean
  eventRows: object
  transactionRows: object
  facilitySummaryListProps: GovUkSummaryListProps
}
