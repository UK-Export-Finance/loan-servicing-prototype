import { FacilityUpdateRequestDto } from 'loan-servicing-common'
import EventBase from 'models/events/eventBase'

export type CreateNewFacilityEvent = EventBase<
  'CreateNewFacility',
  1,
  FacilityUpdateRequestDto
>

export type DeleteFacilityEvent = EventBase<'DeleteFacility', 1, { id: number }>

export type UpdateFacilityEvent = EventBase<'UpdateFacility', 1, Partial<FacilityUpdateRequestDto>>

type FacilityEvent = CreateNewFacilityEvent | DeleteFacilityEvent | UpdateFacilityEvent

export default FacilityEvent
