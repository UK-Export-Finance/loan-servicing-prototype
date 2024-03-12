import {
  AccruingFacilityFeeStrategyOption,
  Facility,
} from 'loan-servicing-common'
import { NunjuckSelectInputOption } from 'types/nunjucks'
import { MandatoryDateInputFormData } from 'utils/form-helpers'

export type AddFacilityFeeNjkInput = {
  facility: Facility
  accruesOnOptions: NunjuckSelectInputOption<
    AccruingFacilityFeeStrategyOption['accruesOn']
  >[]
}

export type AddFixedFacilityFeeFormDto = {
  feeAmount: string
} & MandatoryDateInputFormData<'date'>

export type AddAccruingFacilityFeeFormDto = {
  accruesOn: AccruingFacilityFeeStrategyOption['accruesOn']
  accrualRate: string
} & MandatoryDateInputFormData<'startsFrom'> &
  MandatoryDateInputFormData<'stopsOn'>
