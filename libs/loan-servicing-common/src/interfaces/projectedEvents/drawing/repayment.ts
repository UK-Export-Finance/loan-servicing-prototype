import { ProjectedDrawingEventBase } from '../projectedEventBase'

export type ManualRepaymentEvent = ProjectedDrawingEventBase<
  'ManualRepayment',
  1,
  { amount: string }
>
export type RegularRepaymentEvent = ProjectedDrawingEventBase<
  'RegularRepayment',
  1,
  { totalRepayments: number; repaymentNumber: number }
>

export type RepaymentsEvent = ManualRepaymentEvent | RegularRepaymentEvent
