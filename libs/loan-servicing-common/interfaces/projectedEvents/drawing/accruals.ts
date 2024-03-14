import {
  FixedLoanInterestAccrualStrategyOption,
  MarketLoanInterestAccrualStrategyOption,
} from '../../strategies/drawingAccruals'
import {
  ProjectedDrawingEventBase,
} from '../projectedEventBase'

export type CalculateFixedDrawingAccrualEvent = ProjectedDrawingEventBase<
  'CalculateFixedDrawingAccrual',
  1,
  FixedLoanInterestAccrualStrategyOption
>

export type CalculateMarketDrawingAccrualEvent = ProjectedDrawingEventBase<
  'CalculateMarketDrawingAccrual',
  1,
  MarketLoanInterestAccrualStrategyOption
>

export type CalculateDrawingAccrualEvent =
  | CalculateFixedDrawingAccrualEvent
  | CalculateMarketDrawingAccrualEvent
