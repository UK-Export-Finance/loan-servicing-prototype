import { Facility } from 'loan-servicing-common'
import { MandatoryDateInputFormData } from 'utils/form-helpers'

export type AddFacilityFeeNjkInput = {
  facility: Facility
}

export type AddFixedFacilityFeeFormDto = {
  feeAmount: string
} & MandatoryDateInputFormData<'date'>
