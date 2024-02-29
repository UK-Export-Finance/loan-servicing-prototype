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

export type NewFacilityRequestFormDto = {
  facilityType: string
  obligor: string
  calculateInterestStrategy: CalculateInterestStrategyName
  facilityAmount: string
  repaymentStrategy: RepaymentStrategyName
  repaymentInterval?: string
  interestRate: string
} & MandatoryDateInputFormData<'expiryDate'> &
  MandatoryDateInputFormData<'issuedEffectiveDate'> &
  OptionalDateFormInput<'repaymentStartDate'>
