import EventBase from 'models/interfaces/event'
import Facility from 'models/interfaces/facility'

export type CreateNewFacilityEvent = EventBase<'CreateNewFacility', 1, Facility>

export type DeleteFacilityEvent = EventBase<'DeleteFacility', 1, { id: number }>

type FacilityEvent = CreateNewFacilityEvent | DeleteFacilityEvent

export default FacilityEvent
