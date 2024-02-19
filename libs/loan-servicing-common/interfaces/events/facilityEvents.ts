import { ObjectKeysForType } from '../../utils/type-utils'
import { Facility, NewFacilityRequestDto } from '../facility'
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

export type FacilityIncrementableProperties = ObjectKeysForType<Facility, number>
export type IncrementFacilityValueEvent = EventBase<
  'IncrementFacilityValue',
  1,
  { value: FacilityIncrementableProperties; increment: number }
>

type FacilityEvent =
  | CreateNewFacilityEvent
  | DeleteFacilityEvent
  | UpdateFacilityEvent
  | IncrementFacilityValueEvent

export default FacilityEvent
