import { StrategyOptionsBase } from './strategyOptionsBase'

export type BalancesLookup = { [key: string]: string }

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
