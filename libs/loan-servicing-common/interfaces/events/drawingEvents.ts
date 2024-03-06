import {
  AddWithdrawalToDrawingDto,
  NewDrawingRequestDto,
  RevertWithdrawlDto,
  UpdateDrawingInterestRequestDto,
} from '../drawing'
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
  'WithdrawFromDrawing',
  1,
  AddWithdrawalToDrawingDto
>

export type RevertWithdrawalEvent = EventBase<
  'RevertWithdrawal',
  1,
  RevertWithdrawlDto
>

export type DrawingEvent =
  | CreateNewDrawingEvent
  | UpdateInterestEvent
  | WithdrawFromDrawingEvent
  | RevertWithdrawalEvent
