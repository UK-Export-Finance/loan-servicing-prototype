import { NewFacilityRequestDto } from 'loan-servicing-common'
import EventBase from 'models/interfaces/event'

export type CreateNewFacilityEvent = EventBase<'CreateNewFacility', 1, NewFacilityRequestDto>

export type DeleteFacilityEvent = EventBase<'DeleteFacility', 1, { id: number }>

type FacilityEvent = CreateNewFacilityEvent | DeleteFacilityEvent

export default FacilityEvent
