import { DateInputFormData } from 'utils/form-helpers'

export type FacilityPrincipalAdjustmentFormDto = {
  adjustment: string
} & DateInputFormData<'effectiveDate'>

export type FacilityInterestRateUpdateFormDto = {
  interestRate: string
} & DateInputFormData<'effectiveDate'>


