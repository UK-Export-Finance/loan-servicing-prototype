import { DrawingEvent } from '../../events/drawingEvents'
import { ProjectEvent } from '../projectedEventBase'
import { CalculateDrawingAccrualEvent } from './accruals'
import { InterestEvent } from './interest'
import { RepaymentsEvent } from './repayment'

export type DrawingProjectedEvent = (
  | InterestEvent
  | RepaymentsEvent
  | CalculateDrawingAccrualEvent
  | ProjectEvent<DrawingEvent>
) & { streamVersion?: number }
