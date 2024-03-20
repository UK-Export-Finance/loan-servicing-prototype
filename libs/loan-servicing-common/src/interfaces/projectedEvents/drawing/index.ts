import { DrawingEvent } from '../../events/drawingEvents'
import { ProjectEvent } from '../projectedEventBase'
import { CalculateDrawingAccrualEvent } from './accruals'

export type DrawingProjectedEvent = (
  | CalculateDrawingAccrualEvent
  | ProjectEvent<DrawingEvent>
) & { streamVersion?: number }
