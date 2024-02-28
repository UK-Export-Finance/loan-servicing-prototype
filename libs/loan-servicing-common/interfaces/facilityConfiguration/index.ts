import { CalculateInterestStrategyName, CalculateInterestStrategyOption } from "./interest";
import { RepaymentStrategyName, RepaymentStrategyOptions } from "./repayment";


export type FacilityConfiguration = {
  calculateInterestStrategy: CalculateInterestStrategyOption
  repaymentsStrategy: RepaymentStrategyOptions
}

export type FacilityType = {
  name: string
  interestStrategies: CalculateInterestStrategyName[]
  repaymentsStrategies: RepaymentStrategyName[]
}

