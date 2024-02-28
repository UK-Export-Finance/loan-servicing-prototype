import { CalculateInterestStrategyName, CalculateInterestStrategyOption } from "./interest";


export type FacilityConfiguration = {
  calculateInterestStrategy: CalculateInterestStrategyOption
}

export type FacilityType = {
  name: string
  interestStrategies: CalculateInterestStrategyName[]
}

