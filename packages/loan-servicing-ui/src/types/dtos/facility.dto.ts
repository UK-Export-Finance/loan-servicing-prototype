import { CalculateInterestStrategyName } from 'loan-servicing-common'
import { DateInputFormData, MapDatesToDateFormInputs } from 'utils/form-helpers'

export type FacilityPrincipalAdjustmentFormDto = {
  adjustment: string
} & DateInputFormData<'effectiveDate'>

export type FacilityInterestRateUpdateFormDto = {
  interestRate: string
} & DateInputFormData<'effectiveDate'>

export type NewFacilityRequestFormDto = MapDatesToDateFormInputs<
  {
    obligor: string
    facilityType: string
    calculateInterestStrategy: CalculateInterestStrategyName
    facilityAmount: string
    interestRate: string
    issuedEffectiveDate: Date
    expiryDate: Date
  },
  'expiryDate' | 'issuedEffectiveDate'
>
