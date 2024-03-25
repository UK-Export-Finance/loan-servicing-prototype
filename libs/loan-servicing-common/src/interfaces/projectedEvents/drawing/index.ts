import { DrawingEvent } from '../../events/drawingEvents'
import { ProjectEvent } from '../projectedEventBase'
import { CalculateDrawingAccrualEvent } from './accruals'
import { ForecastRepaymentEvent } from './repayments'

export type DrawingProjectedEvent = (
  | CalculateDrawingAccrualEvent
  | ForecastRepaymentEvent
  | ProjectEvent<DrawingEvent>
) & { streamVersion?: number }
