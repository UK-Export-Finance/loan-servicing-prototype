import { DrawingProjectionEvent, EventBase } from 'loan-servicing-common'

class DrawingProjectionEventDtoClass
  implements Pick<EventBase<string, number, object>,  'effectiveDate' | 'eventData' | 'type'>
{
  effectiveDate!: Date

  type!: string

  eventData!: DrawingProjectionEvent['eventData']
}

export default DrawingProjectionEventDtoClass
