import { NewDrawingRequestDto } from '../drawing'
import { NewFacilityRequestDto } from '../facility'
import {
  AccruingFacilityFeeStrategyOption,
  FixedFacilityFeeStrategyOption,
} from '../strategies/facilityFee'
import { EventBase } from './eventBase'

type FacilityEventBase<
  Type extends string,
  Version extends number,
  Data extends object,
> = EventBase<Type, Version, Data, 'facility'>

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

export type AddDrawingToFacilityEvent = FacilityEventBase<
  'AddDrawingToFacility',
  1,
  NewDrawingRequestDto & { streamId: string }
>

export type AddFixedFacilityFeeEvent = FacilityEventBase<
  'AddFixedFacilityFee',
  1,
  FixedFacilityFeeStrategyOption
>

export type AddAccruingFacilityFeeEvent = FacilityEventBase<
  'AddAccruingFacilityFee',
  1,
  AccruingFacilityFeeStrategyOption
>

export type FacilityEvent =
  | CreateNewFacilityEvent
  | AdjustFacilityAmountEvent
  | AddDrawingToFacilityEvent
  | AddFixedFacilityFeeEvent
  | AddAccruingFacilityFeeEvent
