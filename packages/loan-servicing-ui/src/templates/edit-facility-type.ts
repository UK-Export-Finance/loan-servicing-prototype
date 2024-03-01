import {
  CalculateInterestStrategyName,
  RepaymentStrategyName,
} from 'loan-servicing-common'
import { NunjuckSelectInputOption } from 'types/nunjucks'

export type CreateFacilityTypeNjkInput = {
  calculateInterestSelectOptions: NunjuckSelectInputOption<CalculateInterestStrategyName>[]
  repaymentsSelectOptions: NunjuckSelectInputOption<RepaymentStrategyName>[]
}

export type CreateFacilityTypeFormOutput = {
  name: string
  interestStrategies: CalculateInterestStrategyName[]
  repaymentsStrategies: RepaymentStrategyName[]
}
