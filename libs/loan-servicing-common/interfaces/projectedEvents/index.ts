import { DrawingProjectedEvent } from './drawing'
import { FacilityProjectedEvent } from './facility'

export type ProjectedEvent = (
  | FacilityProjectedEvent
  | DrawingProjectedEvent
) & { streamVersion?: number }
