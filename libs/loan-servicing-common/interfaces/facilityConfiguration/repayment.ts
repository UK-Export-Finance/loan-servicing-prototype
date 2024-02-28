import { StrategyOptionsBase } from './strategyOptionsBase'

export type RegularRepaymentStrategyOptions = StrategyOptionsBase<
  'regular',
  {
    startDate: Date
    monthsBetweenRepayments: number
  }
>

export type ManualRepaymentStrategyOptions = StrategyOptionsBase<
  'manual',
  {
    repayments: { date: Date; amount: string }[]
  }
>

export type RepaymentStrategyOptions =
  | RegularRepaymentStrategyOptions
  | ManualRepaymentStrategyOptions

export type RepaymentStrategyName = RepaymentStrategyOptions['name']
