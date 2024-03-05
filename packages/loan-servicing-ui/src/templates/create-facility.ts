import {
  CalculateInterestStrategyName,
  RepaymentStrategyName,
} from 'loan-servicing-common'
import {
  MandatoryDateInputFormData,
} from 'utils/form-helpers'

export type CreateFacilityNjkInput = {
  calculateInterestStrategy: CalculateInterestStrategyName
  repaymentStrategy: RepaymentStrategyName
  facilityType: string
}

export type NewFacilityRequestFormDto = {
  facilityType: string
  obligor: string
  maxPrincipal: string
} & MandatoryDateInputFormData<'expiryDate'> &
  MandatoryDateInputFormData<'issuedEffectiveDate'>
