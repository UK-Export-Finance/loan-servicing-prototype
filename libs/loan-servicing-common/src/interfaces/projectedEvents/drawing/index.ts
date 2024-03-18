import { DrawingEvent } from '../../events/drawingEvents'
import { ProjectEvent } from '../projectedEventBase'
import { CalculateDrawingAccrualEvent } from './accruals'
import { RepaymentsEvent } from './repayment'

export type DrawingProjectedEvent = (
  | RepaymentsEvent
  | CalculateDrawingAccrualEvent
  | ProjectEvent<DrawingEvent>
) & { streamVersion?: number }
