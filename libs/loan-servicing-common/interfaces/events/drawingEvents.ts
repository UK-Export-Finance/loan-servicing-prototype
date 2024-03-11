import {
  AddWithdrawalToDrawingDto,
  NewDrawingRequestDto,
  RevertWithdrawlDto,
  UpdateDrawingInterestRequestDto,
} from '../drawing'
import { EventBase } from './eventBase'

export type DrawingEventBase<
  Type extends string,
  Version extends number,
  Data extends object,
> = EventBase<Type, Version, Data, 'drawing'>

export type UpdateInterestEvent = DrawingEventBase<
  'UpdateInterest',
  1,
  UpdateDrawingInterestRequestDto
>

export type WithdrawFromDrawingEvent = DrawingEventBase<
  'WithdrawFromDrawing',
  1,
  AddWithdrawalToDrawingDto
>

export type RevertWithdrawalEvent = DrawingEventBase<
  'RevertWithdrawal',
  1,
  RevertWithdrawlDto
>

export type CreateNewDrawingEvent = DrawingEventBase<
  'CreateNewDrawing',
  1,
  NewDrawingRequestDto
>

export type DrawingEvent =
  | UpdateInterestEvent
  | WithdrawFromDrawingEvent
  | RevertWithdrawalEvent
  | CreateNewDrawingEvent
