import { ProjectedDrawingEventBase } from '../projectedEventBase'

export type RepaymentsEvent = ProjectedDrawingEventBase<
  'ManualRepayment',
  1,
  { amount: string }
>
