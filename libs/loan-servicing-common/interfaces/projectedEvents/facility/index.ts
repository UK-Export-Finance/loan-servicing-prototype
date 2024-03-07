import { FacilityEvent } from '../../events/facilityEvents'
import { CalculateFacilityFeeEvent } from './fees'

export type FacilityProjectedEvent = (
  | CalculateFacilityFeeEvent
  | Pick<FacilityEvent, 'effectiveDate' | 'eventData' | 'type'>
) & { streamVersion?: number }
