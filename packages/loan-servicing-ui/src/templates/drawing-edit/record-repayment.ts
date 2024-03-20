import { DrawingDto, Repayment } from 'loan-servicing-common'
import { MandatoryDateInputFormData } from 'utils/form-helpers'

export type RecordRepaymentNjkInput = {
  drawing: DrawingDto
  repayment: Repayment
}

export type RecordRepaymentFormDto = {
  repaymentId: string
  amount: string
} & MandatoryDateInputFormData<'repaymentDate'>
