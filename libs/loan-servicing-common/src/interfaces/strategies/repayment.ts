import { StrategyOptionsBase } from './strategyOptionsBase'

export type RegularRepaymentStrategyOptions = StrategyOptionsBase<
  'Regular',
  {
    startDate: Date
    monthsBetweenRepayments: string
  }
>

export type RepaymentConfig = { date: Date; expectedAmount: string }

export type Repayment = RepaymentConfig & {
  id: string
  settled: boolean
  paidAmount: string
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
