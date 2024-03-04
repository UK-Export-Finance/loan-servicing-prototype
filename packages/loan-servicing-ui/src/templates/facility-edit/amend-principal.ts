import { FacilityDto } from 'loan-servicing-common'
import { MandatoryDateInputFormData } from 'utils/form-helpers'

export type AmendPrincipalNjkInput = {
  facility: FacilityDto
  eventRows: object
  transactionRows: object
}

export type FacilityPrincipalAdjustmentFormDto = {
  adjustment: string
} & MandatoryDateInputFormData<'effectiveDate'>
