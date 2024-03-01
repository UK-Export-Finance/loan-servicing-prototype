import { ProjectedEventBase } from './projectedEventBase'

export type StandardRepaymentEvent = ProjectedEventBase<
  'Repayment',
  1,
  { totalRepayments: number, repaymentNumber: number }
>
export type FinalRepaymentEvent = ProjectedEventBase<
  'FinalRepayment',
  1,
  { totalRepayments: number, repaymentNumber: number }
>

export type RepaymentsEvent = StandardRepaymentEvent | FinalRepaymentEvent

