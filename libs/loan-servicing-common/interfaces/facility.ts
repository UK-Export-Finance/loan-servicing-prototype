import { ReplaceProperty } from '../utils/type-utils'
import type { Drawing } from './drawing'
import { FacilityConfiguration } from './strategies'
import { BalancesLookup } from './strategies/facilityFee'

export type Facility = {
  streamId: string
  obligor: string
  streamVersion: number
  facilityType: string
  facilityFeeBalances: BalancesLookup
  facilityConfig: FacilityConfiguration
  drawings: Drawing[]
  facilityAmount: string
  drawnAmount: string
  undrawnAmount: string
  issuedEffectiveDate: Date
  expiryDate: Date
}

// export type FacilityWithSpecifiedConfig<
//   StrategyGroup extends keyof FacilityConfiguration,
//   StrategyName extends FacilityConfiguration[StrategyGroup]['name'],
// > = ReplaceProperty<
//   Facility,
//   'facilityConfig',
//   SpecifiedFacilityConfig<StrategyGroup, StrategyName>
// >

export type FacilityResponseDto = ReplaceProperty<
  Facility,
  'drawings',
  Omit<Drawing, 'facility'>[]
>

export type AdjustFacilityAmountDto = {
  effectiveDate: string
  adjustment: string
}

export type NewFacilityRequestDto = Omit<
  Facility,
  | 'streamId'
  | 'streamVersion'
  | 'drawings'
  | 'drawnAmount'
  | 'undrawnAmount'
  | 'facilityFeeBalances'
>
