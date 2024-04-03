import {
  AccruingFacilityFeeStrategyOption,
  Facility,
  FacilityType,
} from 'loan-servicing-common'
import { NunjuckSelectInputOption } from 'types/nunjucks'
import { MandatoryDateInputFormData } from 'utils/form-helpers'

export type AddFacilityFeeNjkInput = {
  facility: Facility
  facilityType: FacilityType 
  overrideFacilityType: boolean
  accruesOnOptions: NunjuckSelectInputOption<
    AccruingFacilityFeeStrategyOption['accruesOn']
  >[]
}

export type AddFixedFacilityFeeFormDto = {
  feeAmount: string
  overrideFacilityType: boolean
} & MandatoryDateInputFormData<'effectiveDate'>

export type AddAccruingFacilityFeeFormDto = {
  accruesOn: AccruingFacilityFeeStrategyOption['accruesOn']
  accrualRate: string
  overrideFacilityType: boolean
} & MandatoryDateInputFormData<'effectiveDate'> &
  MandatoryDateInputFormData<'expiryDate'>
