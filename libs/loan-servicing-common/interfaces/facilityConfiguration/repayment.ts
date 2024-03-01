import { StrategyOptionsBase } from './strategyOptionsBase'

export type RegularRepaymentStrategyOptions = StrategyOptionsBase<
  'Regular',
  {
    startDate: Date
    monthsBetweenRepayments: string
  }
>

export type Repayment = { date: Date; amount: string }

export type ManualRepaymentStrategyOptions = StrategyOptionsBase<
  'Manual',
  {
    repayments: Repayment[]
  }
>

export type RepaymentStrategyOptions =
  | RegularRepaymentStrategyOptions
  | ManualRepaymentStrategyOptions

export type RepaymentStrategyName = RepaymentStrategyOptions['name']
