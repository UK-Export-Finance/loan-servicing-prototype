import {
  FixedDrawingAccrualStrategyOption,
  MarketDrawingAccrualStrategyOption,
} from '../../strategies/drawingAccruals'
import {
  ProjectedDrawingEventBase,
} from '../projectedEventBase'

export type CalculateFixedDrawingAccrualEvent = ProjectedDrawingEventBase<
  'CalculateFixedDrawingAccrual',
  1,
  FixedDrawingAccrualStrategyOption
>

export type CalculateMarketDrawingAccrualEvent = ProjectedDrawingEventBase<
  'CalculateMarketDrawingAccrual',
  1,
  MarketDrawingAccrualStrategyOption
>

export type CalculateDrawingAccrualEvent =
  | CalculateFixedDrawingAccrualEvent
  | CalculateMarketDrawingAccrualEvent
