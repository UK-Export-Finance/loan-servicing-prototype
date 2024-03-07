import { ProjectedEventBase } from "../projectedEventBase";

export type CalculateFacilityFeeEvent = ProjectedEventBase<
  'CalculateFacilityFee',
  1,
  { totalRepayments: number; repaymentNumber: number }
>