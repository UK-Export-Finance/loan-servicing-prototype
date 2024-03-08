import { ProjectedFacilityEventBase } from '../projectedEventBase'

export type CalculateFacilityFeeEvent = ProjectedFacilityEventBase<
  'CalculateFacilityFee',
  1,
  { facilityValue: string; accrualRate: string }
>
