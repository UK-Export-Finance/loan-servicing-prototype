import { DrawingEvent } from '../../events/drawingEvents'
import { ProjectEvent } from '../projectedEventBase'
import { InterestEvent } from './interest'
import { RepaymentsEvent } from './repayment'

export type DrawingProjectedEvent = (
  | InterestEvent
  | RepaymentsEvent
  | ProjectEvent<DrawingEvent>
) & { streamVersion?: number }
