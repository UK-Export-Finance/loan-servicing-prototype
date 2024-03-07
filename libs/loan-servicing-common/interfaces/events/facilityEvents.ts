import { NewFacilityRequestDto } from '../facility'
import { EventBase } from './eventBase'

export const facilityEventNames = [
  'CreateNewFacility',
  'AdjustFacilityAmount',
] as const

type FacilityEventBase<
  Type extends (typeof facilityEventNames)[number],
  Version extends number,
  Data extends object,
> = EventBase<Type, Version, Data>

export type CreateNewFacilityEvent = FacilityEventBase<
  'CreateNewFacility',
  1,
  NewFacilityRequestDto
>

export type AdjustFacilityAmountEvent = FacilityEventBase<
  'AdjustFacilityAmount',
  1,
  { adjustment: string }
>

export type FacilityEvent = CreateNewFacilityEvent | AdjustFacilityAmountEvent
