import { LoanServicingEvent } from '.'
import { EventBase } from './eventBase'

type ProjectedEventBase<
  Type extends string,
  Version extends number,
  Data extends object,
> = Pick<EventBase<Type, Version, Data>, 'effectiveDate' | 'eventData' | 'type'>

export type InterestEvent = ProjectedEventBase<'CalculateInterest', 1, {}>

export type StandardRepaymentEvent = ProjectedEventBase<
  'Repayment',
  1,
  { totalRepayments: number }
>
export type FinalRepaymentEvent = ProjectedEventBase<
  'FinalRepayment',
  1,
  { totalRepayments: number }
>

export type RepaymentEvent = StandardRepaymentEvent | FinalRepaymentEvent

export type FacilityProjectionEvent =
  | InterestEvent
  | RepaymentEvent
  | Pick<LoanServicingEvent, 'effectiveDate' | 'eventData' | 'type'>
