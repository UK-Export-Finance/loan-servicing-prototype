import { FacilityEvent } from '../../events/facilityEvents'
import { ProjectEvent } from '../projectedEventBase'
import { CalculateFacilityFeeEvent } from './fees'

export type FacilityProjectedEvent = (
  | CalculateFacilityFeeEvent
  | ProjectEvent<FacilityEvent>
) & { streamVersion?: number }
