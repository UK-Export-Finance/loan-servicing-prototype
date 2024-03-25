import { DrawingDto, DrawingAccrual } from 'loan-servicing-common'

export type RecordAccrualRepaymentNjkInput = {
  drawing: DrawingDto
  accrual: DrawingAccrual
}

export type RecordAccrualPaymentFormDto = {
  accrualId: string
  amount: string
  date: string
}
