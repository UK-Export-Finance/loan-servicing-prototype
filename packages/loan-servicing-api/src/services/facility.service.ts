import { Inject, Injectable } from '@nestjs/common'
import { CreateNewFacilityEvent } from 'models/events/facilityEvents'
import { EventRequest } from 'models/events'
import EventService from './event.service'

@Injectable()
class FacilityService {
  constructor(@Inject(EventService) private eventService: EventService) {}

  async createNewFacility() {
    const createFacilityEvent: EventRequest<CreateNewFacilityEvent> = {
      streamId: 1,
      type: 'CreateNewFacility',
      typeVersion: 1,
      eventData: { obligor: 'test' },
    }
    const result = await this.eventService.saveEvent(createFacilityEvent)
    return result
  }

  async getFacility() {
    const events = await this.eventService.getEvents(1)
    return events.filter(
      (e) => e.type === 'CreateNewFacility',
    ) as CreateNewFacilityEvent[]
  }
}

export default FacilityService
