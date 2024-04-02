import { DrawingAccrualStrategyName } from './drawingAccruals'
import { FacilityFeeStrategyName } from './facilityFee'
import { RepaymentStrategyName, RepaymentStrategyOptions } from './repayment'

export type DrawingConfiguration = {
  repaymentsStrategy: RepaymentStrategyOptions
}

export type FacilityType = {
  name: string
  repaymentsStrategies: RepaymentStrategyName[]
  facilityFeeStrategies: FacilityFeeStrategyName[]
  drawingAccrualStrategies: DrawingAccrualStrategyName[]
}

export type FacilityTypeSettings = {
  [k in keyof Omit<
    FacilityType,
    'name'
  >]: FacilityType[k] extends readonly (infer ElementType)[]
    ? ElementType
    : never
}
