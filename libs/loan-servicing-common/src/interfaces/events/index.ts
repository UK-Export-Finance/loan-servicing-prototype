import { DrawingEvent } from './drawingEvents'
import { FacilityEvent } from './facilityEvents'
import { ParticipationEvent } from './participationEvents'

export type LoanServicingEvent =
  | FacilityEvent
  | DrawingEvent
  | ParticipationEvent
