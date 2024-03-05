import { Facility } from 'loan-servicing-common'
import { GovUkSummaryListProps } from 'types/nunjucks'

export type FacilityNjkInput = {
  facility: Facility
  facilityCreated?: boolean
  eventRows: object
  facilitySummaryListProps: GovUkSummaryListProps
  drawingSummaries: GovUkSummaryListProps[]
}
