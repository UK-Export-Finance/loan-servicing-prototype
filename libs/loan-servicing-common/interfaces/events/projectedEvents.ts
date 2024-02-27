import { LoanServicingEvent } from "."
import { EventBase } from "./eventBase"

export type InterestEvent = EventBase<'CalculateInterest', 1, {}>

export type FacilityProjectionEvent = Pick<
  InterestEvent | LoanServicingEvent,
  'effectiveDate' | 'eventData' | 'type'
>