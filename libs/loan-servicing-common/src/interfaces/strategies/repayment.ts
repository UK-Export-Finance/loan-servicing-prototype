import { StrategyOptionsBase } from './strategyOptionsBase'

export type RegularRepaymentStrategyOptions = StrategyOptionsBase<
  'Regular',
  {
    startDate: Date
    monthsBetweenRepayments: string
  }
>

export type RepaymentConfig = { date: Date; amount: string }

export type Repayment = RepaymentConfig & {
  id: string
  received: boolean
}

export type RecordDrawingRepaymentDto = {
  date: Date
  amount: string
  repaymentId: string
}

export type ManualRepaymentStrategyOptions = StrategyOptionsBase<
  'Manual',
  {
    repayments: RepaymentConfig[]
  }
>

export type RepaymentStrategyOptions =
  | RegularRepaymentStrategyOptions
  | ManualRepaymentStrategyOptions

export type RepaymentStrategyName = RepaymentStrategyOptions['name']
