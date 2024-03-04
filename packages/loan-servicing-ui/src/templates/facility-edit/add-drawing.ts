import { FacilityDto } from 'loan-servicing-common'
import { MandatoryDateInputFormData } from 'utils/form-helpers'

export type AddDrawingNjkInput = {
  facility: FacilityDto
  eventRows: object
  transactionRows: object
}

export type AddDrawingFormDto = {
  amount: string
} & MandatoryDateInputFormData<'date'>
