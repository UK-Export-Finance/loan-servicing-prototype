import { StrategyOptionsBase } from './strategyOptionsBase'

export type NoInterestInterestStrategyOption = StrategyOptionsBase<
  'NoInterest',
  {}
>

export type PrincipalOnlyInterestStrategyOption = StrategyOptionsBase<
  'PrincipalOnly',
  {}
>

export type CompoundingInterestStrategyOption = StrategyOptionsBase<
  'Compounding',
  {}
>

export type CalculateInterestStrategyOption =
  | NoInterestInterestStrategyOption
  | PrincipalOnlyInterestStrategyOption
  | CompoundingInterestStrategyOption

export type CalculateInterestStrategyName =
  CalculateInterestStrategyOption['name']
