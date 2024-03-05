import { DrawingDto } from 'loan-servicing-common'
import { MandatoryDateInputFormData } from 'utils/form-helpers'

export type ChangeInterestNjkInput = {
  drawing: DrawingDto
  eventRows: object
  transactionRows: object
}

export type FacilityInterestRateUpdateFormDto = {
  interestRate: string
} & MandatoryDateInputFormData<'effectiveDate'>
