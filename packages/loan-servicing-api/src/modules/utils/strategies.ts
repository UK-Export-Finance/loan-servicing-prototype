import {
  FacilityConfiguration,
  FacilityWithSpecifiedConfig,
} from 'loan-servicing-common'

export type StrategyLookup<
  StrategyGroup extends keyof FacilityConfiguration,
  ReturnValue,
> = {
  [K in FacilityConfiguration[StrategyGroup]['name']]: (
    facility: FacilityWithSpecifiedConfig<StrategyGroup, K>,
    arg: Extract<FacilityConfiguration[StrategyGroup], { name: K }>,
  ) => ReturnValue
}
