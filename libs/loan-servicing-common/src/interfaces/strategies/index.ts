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
