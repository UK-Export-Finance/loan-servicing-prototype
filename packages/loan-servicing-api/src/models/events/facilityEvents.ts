import EventBase from 'models/interfaces/event'
import Facility from 'models/interfaces/facility'

export type CreateNewFacilityEvent = EventBase<'CreateNewFacility', 1, Facility>

type FacilityEvent = CreateNewFacilityEvent

export default FacilityEvent