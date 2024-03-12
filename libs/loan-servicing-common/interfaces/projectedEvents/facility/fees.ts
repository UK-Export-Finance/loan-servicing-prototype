import {
  AccruingFacilityFeeStrategyOption,
  FixedFacilityFeeStrategyOption,
} from '../../strategies/facilityFee'
import { ProjectedFacilityEventBase } from '../projectedEventBase'

export type CalculateAccruingFacilityFeeEvent = ProjectedFacilityEventBase<
  'CalculateAccruingFacilityFee',
  1,
  AccruingFacilityFeeStrategyOption
>

export type CalculateFixedFacilityFeeEvent = ProjectedFacilityEventBase<
  'CalculateFixedFacilityFee',
  1,
  FixedFacilityFeeStrategyOption
>

export type CalculateFacilityFeeEvent =
  | CalculateAccruingFacilityFeeEvent
  | CalculateFixedFacilityFeeEvent
