import { PropertiesWithType } from '../../utils/type-utils'
import {
  Facility,
  NewFacilityRequestDto,
  UpdateInterestRequestDto,
} from '../facility'
import { EventBase } from './eventBase'

export type CreateNewFacilityEvent = EventBase<
  'CreateNewFacility',
  1,
  NewFacilityRequestDto
>

export type DeleteFacilityEvent = EventBase<'DeleteFacility', 1, {}>

export type UpdateInterestEvent = EventBase<
  'UpdateInterest',
  1,
  UpdateInterestRequestDto
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
  | UpdateInterestEvent
  | AdjustFacilityPrincipalEvent
