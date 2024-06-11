import { DrawingProjectedEvent } from './drawing'
import { FacilityProjectedEvent } from './facility'
import type { ProjectedParticipationEvent } from './participation'

export type ProjectedEvent = (
  | FacilityProjectedEvent
  | DrawingProjectedEvent
  | ProjectedParticipationEvent
) & { streamVersion?: number }
