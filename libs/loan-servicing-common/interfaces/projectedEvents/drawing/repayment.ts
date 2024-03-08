import { ProjectedDrawingEventBase } from '../projectedEventBase'

export type StandardRepaymentEvent = ProjectedDrawingEventBase<
  'Repayment',
  1,
  { totalRepayments: number; repaymentNumber: number }
>
export type FinalRepaymentEvent = ProjectedDrawingEventBase<
  'FinalRepayment',
  1,
  { totalRepayments: number; repaymentNumber: number }
>

export type RepaymentsEvent = StandardRepaymentEvent | FinalRepaymentEvent
