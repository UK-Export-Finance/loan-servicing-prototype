import { NewFacilityRequestDto } from 'loan-servicing-common'
import EventBase from 'models/events/eventBase'

export type CreateNewFacilityEvent = EventBase<
  'CreateNewFacility',
  1,
  NewFacilityRequestDto
>

export type DeleteFacilityEvent = EventBase<'DeleteFacility', 1, null>

export type UpdateFacilityEvent = EventBase<
  'UpdateFacility',
  1,
  Partial<NewFacilityRequestDto>
>

type FacilityEvent =
  | CreateNewFacilityEvent
  | DeleteFacilityEvent
  | UpdateFacilityEvent

export default FacilityEvent
