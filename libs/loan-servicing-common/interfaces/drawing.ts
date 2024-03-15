import type { Facility } from './facility'
import { ConvertToDtoType } from '../utils/type-utils'
import { DrawingConfiguration } from './strategies'
import { DrawingAccrual } from './strategies/drawingAccruals'

export type Drawing = {
  streamId: string
  streamVersion: number
  facility: Facility
  drawingConfig: DrawingConfiguration
  outstandingPrincipal: string
  accruals: DrawingAccrual[]
  issuedEffectiveDate: Date
  expiryDate: Date
}

export type NewDrawingRequestDto = Omit<
  Drawing,
  | 'streamId'
  | 'streamVersion'
  | 'facility'
>

export type DrawingDto = ConvertToDtoType<Drawing>

export type AddWithdrawalToDrawingDto = {
  date: Date
  amount: string
}

export type RevertWithdrawlDto = {
  drawingStreamId: string
  withdrawalEventStreamVersion: number
  dateOfWithdrawal: Date
}
