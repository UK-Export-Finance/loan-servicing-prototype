import {
  AccruingFacilityFeeStrategyOption,
  FixedFacilityFeeStrategyOption,
} from '../../strategies/facilityFee'
import { ProjectedFacilityEventBase } from '../projectedEventBase'

type CalculateFacilityFeeEventBase<
  Type extends string,
  Version extends number,
  Data extends object,
> = ProjectedFacilityEventBase<Type, Version, Data & { feeId: string }>

export type CalculateAccruingFacilityFeeEvent = CalculateFacilityFeeEventBase<
  'CalculateAccruingFacilityFee',
  1,
  AccruingFacilityFeeStrategyOption
>

export type CalculateFixedFacilityFeeEvent = CalculateFacilityFeeEventBase<
  'CalculateFixedFacilityFee',
  1,
  FixedFacilityFeeStrategyOption
>

export type CalculateFacilityFeeEvent =
  | CalculateAccruingFacilityFeeEvent
  | CalculateFixedFacilityFeeEvent
