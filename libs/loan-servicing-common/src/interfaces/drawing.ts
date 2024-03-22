import type { Facility } from './facility'
import { ConvertToDtoType } from '../utils/type-utils'
import { DrawingConfiguration } from './strategies'
import { DrawingAccrual } from './strategies/drawingAccruals'
import { Repayment } from './strategies/repayment'

export type Drawing = {
  streamId: string
  streamVersion: number
  currentDate: Date
  facility: Facility
  outstandingPrincipal: string
  drawnAmount: string
  accruals: DrawingAccrual[]
  repayments: Repayment[]
  issuedEffectiveDate: Date
  expiryDate: Date
}

export type NewDrawingRequestDto = Omit<
  Drawing,
  | 'streamId'
  | 'streamVersion'
  | 'facility'
  | 'drawnAmount'
  | 'repayments'
  | 'currentDate'
> & {
  drawingConfig: DrawingConfiguration
}

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
