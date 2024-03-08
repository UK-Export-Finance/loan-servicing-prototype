import { StrategyOptionsBase } from './strategyOptionsBase'

export type AccruingFacilityFeeStrategyOption = StrategyOptionsBase<
  'AccruingFacilityFee',
  {
    accruesOn: 'drawnAmount' | 'facilityAmount' | 'undrawnAmount'
    accrualRate: string
  }
>

export type FixedFacilityFeeStrategyOption = StrategyOptionsBase<
  'FixedFacilityFee',
  {
    feeAmount: string
    date: Date
  }
>

export type FacilityFeeStrategyOption =
  | AccruingFacilityFeeStrategyOption
  | FixedFacilityFeeStrategyOption

export type FacilityFeeStrategyName = FacilityFeeStrategyOption['name']
