import { Facility, RepaymentStrategyName } from 'loan-servicing-common'
import {
  MandatoryDateInputFormData,
  OptionalDateFormInput,
} from 'utils/form-helpers'

export type CreateDrawingNjkInput = {
  repaymentStrategy: RepaymentStrategyName
  facility: Facility
}
export type PermittedRepaymentNumbers = '1' | '2' | '3' | '4' | '5'

type ManualRepaymentFormData<Id extends string> = {
  [key in `repaymentAmount${Id}`]?: string
} & OptionalDateFormInput<`repaymentDate${Id}`>

export type NewDrawingRequestFormDto = {
  repaymentStrategy: RepaymentStrategyName
  repaymentInterval?: string
  initialDrawnAmount: string
  facilityId: string
} & MandatoryDateInputFormData<'expiryDate'> &
  MandatoryDateInputFormData<'issuedEffectiveDate'> &
  OptionalDateFormInput<'repaymentStartDate'> &
  ManualRepaymentFormData<PermittedRepaymentNumbers>
