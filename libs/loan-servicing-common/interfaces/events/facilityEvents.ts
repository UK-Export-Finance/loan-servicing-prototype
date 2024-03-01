import { NewFacilityRequestDto, UpdateInterestRequestDto } from '../facility'
import { EventBase } from './eventBase'

export type CreateNewFacilityEvent = EventBase<
  'CreateNewFacility',
  1,
  NewFacilityRequestDto
>

export type UpdateInterestEvent = EventBase<
  'UpdateInterest',
  1,
  UpdateInterestRequestDto
>

export type AdjustFacilityPrincipalEvent = EventBase<
  'AdjustFacilityPrincipal',
  1,
  { adjustment: string }
>

export type FacilityEvent =
  | CreateNewFacilityEvent
  | UpdateInterestEvent
  | AdjustFacilityPrincipalEvent
