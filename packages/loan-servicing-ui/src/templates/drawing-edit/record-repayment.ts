import { DrawingDto, Repayment } from 'loan-servicing-common'

export type RecordRepaymentNjkInput = {
  drawing: DrawingDto
  repayment: Repayment
}

export type RecordRepaymentFormDto = {
  repaymentId: string
  amount: string
  repaymentDate: string
}
