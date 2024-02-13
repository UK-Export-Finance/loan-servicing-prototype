import { Inject, Injectable } from '@nestjs/common'
import { CreateNewFacilityEvent } from 'models/events/facilityEvents'
import { NewEvent } from 'models/events'
import { InjectRepository } from '@nestjs/typeorm'
import FacilityEntity from 'models/entities/FacilityEntity'
import { Repository } from 'typeorm'
import EventService from './event.service'

@Injectable()
class FacilityService {
  constructor(
    @Inject(EventService) private eventService: EventService,
    @InjectRepository(FacilityEntity)
    private facilityRepo: Repository<FacilityEntity>,
  ) {}

  async createNewFacility() {
    const createFacilityEvent: NewEvent<CreateNewFacilityEvent> = {
      streamId: 1,
      type: 'CreateNewFacility',
      typeVersion: 1,
      eventData: { obligor: 'test' },
    }
    const savedEvent = await this.eventService.saveEvent(createFacilityEvent)

    const updatedProjection = await this.facilityRepo.create({
      ...savedEvent.eventData,
    })
    await this.facilityRepo.save(updatedProjection)

    return updatedProjection
  }

  async getFacility() {
    const events = await this.eventService.getEvents(1)
    return events.filter(
      (e) => e.type === 'CreateNewFacility',
    ) as CreateNewFacilityEvent[]
  }
}

export default FacilityService
