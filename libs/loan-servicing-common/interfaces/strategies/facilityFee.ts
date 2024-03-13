import { StrategyOptionsBase } from './strategyOptionsBase'

export type BalancesLookup = { [key: string]: string }

export type AccruingFacilityFeeStrategyOption = StrategyOptionsBase<
  'AccruingFacilityFee',
  {
    feeId: string
    accruesOn: 'drawnAmount' | 'facilityAmount' | 'undrawnAmount'
    accrualRate: string
    effectiveDate: Date
    expiryDate: Date
  }
>

export type AddAccruingFacilityFeeDto = Omit<
  AccruingFacilityFeeStrategyOption,
  'feeId'
>

export type FixedFacilityFeeStrategyOption = StrategyOptionsBase<
  'FixedFacilityFee',
  {
    feeId: string
    feeAmount: string
    effectiveDate: Date
  }
>

export type AddFixedFacilityFeeDto = Omit<
  FixedFacilityFeeStrategyOption,
  'feeId'
>

export type FacilityFeeStrategyOption =
  | AccruingFacilityFeeStrategyOption
  | FixedFacilityFeeStrategyOption

export type AddFacilityFeeDto = Omit<FacilityFeeStrategyOption, 'feeId'>

export type FacilityFeeStrategyName = FacilityFeeStrategyOption['name']
