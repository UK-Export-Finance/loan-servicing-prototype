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

export type AdjustFacilityMaxPrincipalEvent = EventBase<
  'AdjustFacilityMaxPrincipal',
  1,
  { adjustment: string }
>

export type AddDrawingEvent = EventBase<
  'AddDrawing',
  1,
  { date: Date; amount: string }
>

export type FacilityEvent =
  | CreateNewFacilityEvent
  | UpdateInterestEvent
  | AdjustFacilityMaxPrincipalEvent
  | AddDrawingEvent
