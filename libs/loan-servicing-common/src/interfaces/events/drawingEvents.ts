import {
  AddWithdrawalToDrawingDto,
  NewDrawingRequestDto,
  RevertWithdrawlDto,
} from '../drawing'
import { DrawingAccrualStrategyOption } from '../strategies/drawingAccruals'
import { RepaymentStrategyOptions } from '../strategies/repayment'
import { EventBase } from './eventBase'

export type DrawingEventBase<
  Type extends string,
  Version extends number,
  Data extends object,
> = EventBase<Type, Version, Data, 'drawing'>

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

export type SetDrawingRepaymentsEvent = DrawingEventBase<
  'SetDrawingRepayments',
  1,
  RepaymentStrategyOptions
>

export type RecordDrawingRepaymentEvent = DrawingEventBase<
  'RecordDrawingRepayment',
  1,
  { repaymentId: string; amount: string }
>

export type AddDrawingAccrualEvent = DrawingEventBase<
  'AddDrawingAccrual',
  1,
  DrawingAccrualStrategyOption
>

export type RecordDrawingAccrualPaymentEvent = DrawingEventBase<
  'RecordDrawingAccrualPayment',
  1,
  { accrualId: string; amount: string }
>

export type DrawingEvent =
  | WithdrawFromDrawingEvent
  | RevertWithdrawalEvent
  | CreateNewDrawingEvent
  | SetDrawingRepaymentsEvent
  | AddDrawingAccrualEvent
  | RecordDrawingRepaymentEvent
  | RecordDrawingAccrualPaymentEvent
