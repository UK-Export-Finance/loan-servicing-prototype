import { EventBase } from './eventBase'
import { FacilityEvent } from './facilityEvents'

export type LoanServicingEvent =
  | FacilityEvent
  | EventBase<'OtherEvent', 1, { randomProp: string }>

export type EventTypes = LoanServicingEvent['type']
