import { Inject, Injectable } from '@nestjs/common'
import { FacilityCreatedEvent } from 'models/events/BaseEvent'
import EventService from './event.service'

@Injectable()
class FacilityService {
  constructor(@Inject(EventService) private eventService: EventService) {}

  async createNewFacility() {
    const createFacilityEvent: FacilityCreatedEvent = {
      type: 'FacilityCreated',
      typeVersion: 1,
      obligor: 'test',
    }
    const result = await this.eventService.saveEvent(createFacilityEvent)
    return result.eventData
  }

  getFacility() {
    return this.eventService.getEvents(1)
  }
}

export default FacilityService
