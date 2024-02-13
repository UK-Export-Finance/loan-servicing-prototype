import { Inject, Injectable } from '@nestjs/common'
import { CreateNewFacilityEvent } from 'models/events/facilityEvents'
import { NewEvent } from 'models/events'
import { InjectRepository } from '@nestjs/typeorm'
import FacilityEntity from 'models/entities/FacilityEntity'
import { Repository } from 'typeorm'
import { Facility, NewFacilityRequestDto } from 'loan-servicing-common'
import EventService from './event.service'

@Injectable()
class FacilityService {
  constructor(
    @Inject(EventService) private eventService: EventService,
    @InjectRepository(FacilityEntity)
    private facilityRepo: Repository<FacilityEntity>,
  ) {}

  async createNewFacility(facility: NewFacilityRequestDto): Promise<Facility> {
    const createFacilityEvent: NewEvent<CreateNewFacilityEvent> = {
      streamId: crypto.randomUUID(),
      type: 'CreateNewFacility',
      typeVersion: 1,
      eventData: facility,
    }
    const savedEvent = await this.eventService.saveEvent(createFacilityEvent)

    const updatedProjection = await this.facilityRepo.create({
      ...savedEvent.eventData,
      streamId: savedEvent.streamId,
    })
    await this.facilityRepo.save(updatedProjection)

    return updatedProjection
  }

  async getFacilityEvents(streamId: string): Promise<CreateNewFacilityEvent[]> {
    const events = await this.eventService.getEvents(streamId)
    return events.filter(
      (e) => e.type === 'CreateNewFacility',
    ) as CreateNewFacilityEvent[]
  }
}

export default FacilityService
