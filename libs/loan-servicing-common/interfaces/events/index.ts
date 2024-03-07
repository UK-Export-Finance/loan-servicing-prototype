import { DrawingEvent, drawingEventNames } from './drawingEvents'
import { FacilityEvent, facilityEventNames } from './facilityEvents'

export type LoanServicingEvent = FacilityEvent | DrawingEvent

export const eventTypeNames = [
  ...facilityEventNames,
  ...drawingEventNames,
] as const
