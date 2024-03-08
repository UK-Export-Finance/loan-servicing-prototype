import { ProjectedEvent } from 'loan-servicing-common'

class DrawingProjectionEventDtoClass
  implements Pick<ProjectedEvent, 'effectiveDate' | 'eventData' | 'type'>
{
  effectiveDate!: Date

  type!: ProjectedEvent['type']

  eventData!: ProjectedEvent['eventData']
}

export default DrawingProjectionEventDtoClass
