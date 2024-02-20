import { PropertiesWithType } from '../../utils/type-utils'
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

export type FacilityIncrementableProperties = PropertiesWithType<
  Facility,
  number
>
export type AdjustFacilityPrincipalEvent = EventBase<
  'AdjustFacilityPrincipal',
  1,
  { adjustment: number }
>

export type FacilityEvent =
  | CreateNewFacilityEvent
  | DeleteFacilityEvent
  | UpdateFacilityEvent
  | AdjustFacilityPrincipalEvent
