import { NewFacilityRequestDto } from 'loan-servicing-common'
import { DateInputFormData, MapDatesToDateFormInputs } from 'utils/form-helpers'

export type FacilityPrincipalAdjustmentFormDto = {
  adjustment: number
} & DateInputFormData<'effectiveDate'>

export type NewFacilityRequestFormDto = MapDatesToDateFormInputs<
  NewFacilityRequestDto,
  'expiryDate' | 'issuedEffectiveDate'
>