import { DrawingDto } from 'loan-servicing-common'
import { MandatoryDateInputFormData } from 'utils/form-helpers'

export type AddWithdrawalToDrawingNjkInput = {
  drawing: DrawingDto
}

export type AddWithdrawalToDrawingFormDto = {
  amount: string
} & MandatoryDateInputFormData<'date'>
