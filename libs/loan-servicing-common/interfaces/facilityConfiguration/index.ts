import {
  CalculateInterestStrategyName,
  CalculateInterestStrategyOption,
} from './interest'
import { RepaymentStrategyName, RepaymentStrategyOptions } from './repayment'

export type FacilityConfiguration = {
  calculateInterestStrategy: CalculateInterestStrategyOption
  repaymentsStrategy: RepaymentStrategyOptions
}

export type SpecifiedFacilityConfig<
  StrategyGroup extends keyof FacilityConfiguration,
  StrategyName extends FacilityConfiguration[StrategyGroup]['name'],
> = Omit<FacilityConfiguration, StrategyGroup> & {
  [k in StrategyGroup]: Extract<
    FacilityConfiguration[StrategyGroup],
    { name: StrategyName }
  >
}

export type FacilityType = {
  name: string
  interestStrategies: CalculateInterestStrategyName[]
  repaymentsStrategies: RepaymentStrategyName[]
}
