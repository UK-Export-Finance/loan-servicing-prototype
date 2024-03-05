import type { Facility } from './facility'
import { ConvertToDtoType, ReplaceProperty } from '../utils/type-utils'
import {
  DrawingConfiguration,
  SpecifiedDrawingConfig,
} from './facilityConfiguration'

export type Drawing = {
  streamId: string
  streamVersion: number
  facilityStreamId: string
  facility: Facility
  drawingConfig: DrawingConfiguration
  //   description: string
  //   currency: string
  outstandingPrincipal: string
  interestAccrued: string
  interestRate: string
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
  | 'outstandingPrincipal'
  | 'facility'
  | 'facilityStreamId'
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