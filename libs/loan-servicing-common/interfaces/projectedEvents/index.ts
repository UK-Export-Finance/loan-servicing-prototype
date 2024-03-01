import { LoanServicingEvent } from '../events'
import { InterestEvent } from './interest'
import { RepaymentsEvent } from './repayment'

export type FacilityProjectionEvent =
  | InterestEvent
  | RepaymentsEvent
  | Pick<LoanServicingEvent, 'effectiveDate' | 'eventData' | 'type'>
