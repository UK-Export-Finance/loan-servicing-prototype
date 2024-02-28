import { StrategyOptionsBase } from './strategyOptionsBase'

export type RegularRepaymentStrategyOptions = StrategyOptionsBase<
  'Regular',
  {
    startDate: Date
    monthsBetweenRepayments: number
  }
>

export type ManualRepaymentStrategyOptions = StrategyOptionsBase<
  'Manual',
  {
    repayments: { date: Date; amount: string }[]
  }
>

export type RepaymentStrategyOptions =
  | RegularRepaymentStrategyOptions
  | ManualRepaymentStrategyOptions

export type RepaymentStrategyName = RepaymentStrategyOptions['name']
