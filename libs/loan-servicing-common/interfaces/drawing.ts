import type { Facility } from './facility'
import { ConvertToDtoType, ReplaceProperty } from '../utils/type-utils'
import { DrawingConfiguration, SpecifiedDrawingConfig } from './strategies'
import { DrawingAccrual } from './strategies/drawingAccruals'

export type Drawing = {
  streamId: string
  streamVersion: number
  facility: Facility
  drawingConfig: DrawingConfiguration
  //   description: string
  //   currency: string
  outstandingPrincipal: string
  interestAccrued: string
  interestRate: string
  accruals: DrawingAccrual[]
  //   commitmentDate: Date
  //   issuedNotEffectiveDate: Date
  issuedEffectiveDate: Date
  //   availabilityDate: Date
  expiryDate: Date
  //   usedAmount: number
  //   availableAmount: number
}

export type DrawingWithSpecifiedConfig<
  StrategyGroup extends keyof DrawingConfiguration,
  StrategyName extends DrawingConfiguration[StrategyGroup]['name'],
> = ReplaceProperty<
  Drawing,
  'drawingConfig',
  SpecifiedDrawingConfig<StrategyGroup, StrategyName>
>

export type NewDrawingRequestDto = Omit<
  Drawing,
  | 'streamId'
  | 'streamVersion'
  | 'interestAccrued'
  | 'facility'
>

export type DrawingDto = ConvertToDtoType<Drawing>

export type UpdateDrawingInterestRequestDto = {
  effectiveDate: string
  interestRate: string
}

export type AddWithdrawalToDrawingDto = {
  date: Date
  amount: string
}

export type RevertWithdrawlDto = {
  drawingStreamId: string
  withdrawalEventStreamVersion: number
  dateOfWithdrawal: Date
}
