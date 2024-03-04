import { DrawingDto } from 'loan-servicing-common'
import { MandatoryDateInputFormData } from 'utils/form-helpers'

export type AmendPrincipalNjkInput = {
  facility: DrawingDto
  eventRows: object
  transactionRows: object
}

export type FacilityPrincipalAdjustmentFormDto = {
  adjustment: string
} & MandatoryDateInputFormData<'effectiveDate'>
