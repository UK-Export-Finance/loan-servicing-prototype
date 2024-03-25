import { ProjectedDrawingEventBase } from '../projectedEventBase'

export type ForecastRepaymentEvent = ProjectedDrawingEventBase<
  'ForecastDrawingRepayment',
  1,
  { repaymentId: string; amount: string }
>
