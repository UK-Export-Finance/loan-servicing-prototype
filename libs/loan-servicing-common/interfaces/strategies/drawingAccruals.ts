import { StrategyOptionsBase } from './strategyOptionsBase'

type AccrualStrategyOptionBase<
  Name extends string,
  Options extends object,
> = StrategyOptionsBase<
  Name,
  Options & {
    accrualId: string
    effectiveDate: Date
    expiryDate: Date
  }
>

export type FixedLoanInterestAccrualStrategyOption = AccrualStrategyOptionBase<
  'FixedLoanInterestAccrual',
  {
    accrualRate: string
  }
>

export type AddFixedLoanInterestAccrualDto = Omit<
  FixedLoanInterestAccrualStrategyOption,
  'accrualId' | 'isNotional'
>

export type MarketLoanInterestAccrualStrategyOption = AccrualStrategyOptionBase<
  'MarketLoanInterestAccrual',
  {
    accrualRate: string
  }
>

export type AddMarketLoanInterestAccrualDto = Omit<
  MarketLoanInterestAccrualStrategyOption,
  'accrualId' | 'isNotional'
>

export type DrawingAccrualStrategyOption =
  | FixedLoanInterestAccrualStrategyOption
  | MarketLoanInterestAccrualStrategyOption

export type DrawingAccrualStrategyName = DrawingAccrualStrategyOption['name']

export type DrawingAccrual = {
  id: string
  balance: string
  config: DrawingAccrualStrategyOption
}
