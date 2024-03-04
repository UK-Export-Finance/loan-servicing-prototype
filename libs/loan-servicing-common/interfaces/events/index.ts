import { DrawingEvent } from './drawingEvents'
import { FacilityEvent } from './facilityEvents'

export type LoanServicingEvent = FacilityEvent | DrawingEvent

export type EventTypes = LoanServicingEvent['type']
