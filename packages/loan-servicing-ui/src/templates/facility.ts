import { FacilityDto } from 'loan-servicing-common'

export type FacilityNjkInput = {
  facility: FacilityDto
  facilityCreated?: boolean
  eventRows: object
  transactionRows: object
}
