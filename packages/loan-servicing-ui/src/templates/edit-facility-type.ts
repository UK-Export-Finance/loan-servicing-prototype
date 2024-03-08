import {
  CalculateInterestStrategyName,
  FacilityFeeStrategyName,
  RepaymentStrategyName,
} from 'loan-servicing-common'
import { NunjuckSelectInputOption } from 'types/nunjucks'

export type CreateFacilityTypeNjkInput = {
  calculateInterestSelectOptions: NunjuckSelectInputOption<CalculateInterestStrategyName>[]
  repaymentsSelectOptions: NunjuckSelectInputOption<RepaymentStrategyName>[]
  facilityFeeSelectOptions: NunjuckSelectInputOption<FacilityFeeStrategyName>[]
}

export type CreateFacilityTypeFormOutput = {
  name: string
  interestStrategies: CalculateInterestStrategyName[]
  repaymentsStrategies: RepaymentStrategyName[]
  facilityFeeStrategies: FacilityFeeStrategyName[]
}
