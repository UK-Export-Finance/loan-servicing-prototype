import {
  ConvertToFormType,
  DrawingDto,
  RevertWithdrawlDto,
} from 'loan-servicing-common'

export type RevertWithdrawalNjkInput = {
  drawing: DrawingDto
  revertWithdrawalDto: ConvertToFormType<RevertWithdrawlDto>
}
