import {
  CalculateInterestStrategyName,
  RepaymentStrategyName,
} from 'loan-servicing-common'
import {
  MandatoryDateInputFormData,
  OptionalDateFormInput,
} from 'utils/form-helpers'

export type CreateFacilityNjkInput = {
  calculateInterestStrategy: CalculateInterestStrategyName
  repaymentStrategy: RepaymentStrategyName
  facilityType: string
}
export type PermittedRepaymentNumbers = '1' | '2' | '3' | '4' | '5'

type ManualRepaymentFormData<Id extends string> = {
  [key in `repaymentAmount${Id}`]?: string
} & OptionalDateFormInput<`repaymentDate${Id}`>

export type NewFacilityRequestFormDto = {
  facilityType: string
  obligor: string
  calculateInterestStrategy: CalculateInterestStrategyName
  maxPrincipal: string
  repaymentStrategy: RepaymentStrategyName
  repaymentInterval?: string
  interestRate: string
} & MandatoryDateInputFormData<'expiryDate'> &
  MandatoryDateInputFormData<'issuedEffectiveDate'> &
  OptionalDateFormInput<'repaymentStartDate'> &
  ManualRepaymentFormData<PermittedRepaymentNumbers>
