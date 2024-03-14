import { ReplaceProperty } from '../../utils/type-utils'
import {
  FacilityFeeStrategyName,
} from './facilityFee'
import {
  CalculateInterestStrategyName,
  CalculateInterestStrategyOption,
} from './interest'
import { RepaymentStrategyName, RepaymentStrategyOptions } from './repayment'

export type DrawingConfiguration = {
  calculateInterestStrategy: CalculateInterestStrategyOption
  repaymentsStrategy: RepaymentStrategyOptions
}

export type SpecifiedDrawingConfig<
  StrategyGroup extends keyof DrawingConfiguration,
  StrategyName extends DrawingConfiguration[StrategyGroup]['name'],
> = ReplaceProperty<
  DrawingConfiguration,
  StrategyGroup,
  Extract<DrawingConfiguration[StrategyGroup], { name: StrategyName }>
>

export type FacilityType = {
  name: string
  interestStrategies: CalculateInterestStrategyName[]
  repaymentsStrategies: RepaymentStrategyName[]
  facilityFeeStrategies: FacilityFeeStrategyName[]
}
