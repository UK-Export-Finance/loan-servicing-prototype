import { FacilityDto } from 'loan-servicing-common'
import { MandatoryDateInputFormData } from 'utils/form-helpers'

export type AmendPrincipalNjkInput = {
  facility: FacilityDto
  eventRows: object
  transactionRows: object
}

export type FacilityInterestRateUpdateFormDto = {
  interestRate: string
} & MandatoryDateInputFormData<'effectiveDate'>
