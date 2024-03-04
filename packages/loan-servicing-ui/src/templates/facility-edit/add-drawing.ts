import { DrawingDto } from 'loan-servicing-common'
import { MandatoryDateInputFormData } from 'utils/form-helpers'

export type AddDrawingNjkInput = {
  facility: DrawingDto
  eventRows: object
  transactionRows: object
}

export type AddDrawingFormDto = {
  amount: string
} & MandatoryDateInputFormData<'date'>
