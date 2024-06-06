import { DrawingEvent } from './drawingEvents'
import { FacilityEvent } from './facilityEvents'
import type { ParticipationEvent } from './participationEvents'

export type LoanServicingEvent =
  | FacilityEvent
  | DrawingEvent
  | ParticipationEvent
