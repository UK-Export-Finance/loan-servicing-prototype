import { DrawingEvent } from '../../events/drawingEvents'
import { InterestEvent } from './interest'
import { RepaymentsEvent } from './repayment'

export type DrawingProjectedEvent = (
  | InterestEvent
  | RepaymentsEvent
  | Pick<DrawingEvent, 'effectiveDate' | 'eventData' | 'type'>
) & { streamVersion?: number }
