import { NewDrawingRequestDto, UpdateDrawingInterestRequestDto } from '../drawing'
import { EventBase } from './eventBase'

export type CreateNewDrawingEvent = EventBase<
  'CreateNewDrawing',
  1,
  NewDrawingRequestDto
>

export type UpdateInterestEvent = EventBase<
  'UpdateInterest',
  1,
  UpdateDrawingInterestRequestDto
>

export type WithdrawFromDrawingEvent = EventBase<
  'WithdrawFromDrawingEvent',
  1,
  { date: Date; amount: string }
>

export type DrawingEvent =
  | CreateNewDrawingEvent
  | UpdateInterestEvent
  | WithdrawFromDrawingEvent
