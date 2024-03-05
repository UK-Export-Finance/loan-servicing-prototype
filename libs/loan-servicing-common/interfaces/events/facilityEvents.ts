import { NewFacilityRequestDto } from '../facility'
import { EventBase } from './eventBase'

export type CreateNewFacilityEvent = EventBase<
  'CreateNewFacility',
  1,
  NewFacilityRequestDto
>

export type AdjustFacilityAmountEvent = EventBase<
  'AdjustFacilityAmount',
  1,
  { adjustment: string }
>

export type FacilityEvent = CreateNewFacilityEvent | AdjustFacilityAmountEvent
