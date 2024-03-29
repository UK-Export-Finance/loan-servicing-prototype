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

export type FixedDrawingAccrualStrategyOption = AccrualStrategyOptionBase<
  'FixedDrawingAccrual',
  {
    accrualRate: string
    monthsBetweenPayment: number
  }
>

export type AddFixedDrawingAccrualDto = Omit<
  FixedDrawingAccrualStrategyOption,
  'accrualId' | 'isNotional' | 'name'
>

export type MarketDrawingAccrualStrategyOption = AccrualStrategyOptionBase<
  'MarketDrawingAccrual',
  {
    accrualRate: string
    monthsBetweenPayment: number
  }
>

export type AddMarketDrawingAccrualDto = Omit<
  MarketDrawingAccrualStrategyOption,
  'accrualId' | 'isNotional' | 'name'
>

export type DrawingAccrualStrategyOption =
  | FixedDrawingAccrualStrategyOption
  | MarketDrawingAccrualStrategyOption

export type DrawingAccrualStrategyName = DrawingAccrualStrategyOption['name']

export type DrawingAccrual = {
  id: string
  accruedFee: string
  predictedFinalFee: string
  paidAmount: string
  unpaidAmount: string
  isSettled: boolean
  config: DrawingAccrualStrategyOption
}

export type RecordDrawingAccrualPaymentDto = {
  date: Date
  amount: string
  accrualId: string
}
