import { DrawingDto } from 'loan-servicing-common'
import { MandatoryDateInputFormData } from 'utils/form-helpers'

export type AddWithdrawalToDrawingNjkInput = {
  drawing: DrawingDto
  eventRows: object
  transactionRows: object
}

export type AddWithdrawalToDrawingFormDto = {
  amount: string
} & MandatoryDateInputFormData<'date'>
