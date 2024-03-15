import {
  DrawingAccrualStrategyName,
  FacilityFeeStrategyName,
  RepaymentStrategyName,
} from 'loan-servicing-common'
import { NunjuckSelectInputOption } from 'types/nunjucks'

export type CreateFacilityTypeNjkInput = {
  drawingAccrualSelectOptions: NunjuckSelectInputOption<DrawingAccrualStrategyName>[]
  repaymentsSelectOptions: NunjuckSelectInputOption<RepaymentStrategyName>[]
  facilityFeeSelectOptions: NunjuckSelectInputOption<FacilityFeeStrategyName>[]
}

export type CreateFacilityTypeFormOutput = {
  name: string
  drawingAccrualStrategies: DrawingAccrualStrategyName[]
  repaymentsStrategies: RepaymentStrategyName[]
  facilityFeeStrategies: FacilityFeeStrategyName[]
}
