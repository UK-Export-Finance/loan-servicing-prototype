import { DrawingProjectedEvent, EventBase } from 'loan-servicing-common'

class DrawingProjectionEventDtoClass
  implements Pick<EventBase<string, number, object>,  'effectiveDate' | 'eventData' | 'type'>
{
  effectiveDate!: Date

  type!: string

  eventData!: DrawingProjectedEvent['eventData']
}

export default DrawingProjectionEventDtoClass
