import { NewFacilityRequestDto } from '../facility'
import { EventBase } from './eventBase'

export type CreateNewFacilityEvent = EventBase<
  'CreateNewFacility',
  1,
  NewFacilityRequestDto
>

export type DeleteFacilityEvent = EventBase<'DeleteFacility', 1, {}>

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
