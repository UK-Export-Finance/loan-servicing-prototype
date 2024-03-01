import { FacilityDto } from 'loan-servicing-common'

export type AmendPrincipalNjkInput = {
    facility: FacilityDto
    eventRows: object
    transactionRows: object
  }
