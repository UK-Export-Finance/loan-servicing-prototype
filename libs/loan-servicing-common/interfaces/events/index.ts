import { FacilityEvent } from './facilityEvents'

export type LoanServicingEvent =
  | FacilityEvent

export type EventTypes = LoanServicingEvent['type']
