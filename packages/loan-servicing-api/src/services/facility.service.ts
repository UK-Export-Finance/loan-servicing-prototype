import { Inject, Injectable } from '@nestjs/common'
import {
  CreateNewFacilityEvent,
  UpdateFacilityEvent,
} from 'models/events/facilityEvents'
import Event, { NewEvent } from 'models/events'
import { InjectRepository } from '@nestjs/typeorm'
import FacilityEntity from 'models/entities/FacilityEntity'
import { Repository } from 'typeorm'
import { Facility, FacilityUpdateRequestDto } from 'loan-servicing-common'
import EventEntity from 'models/entities/EventEntity'
import EventService from './event.service'

@Injectable()
class FacilityService {
  constructor(
    @Inject(EventService) private eventService: EventService,
    @InjectRepository(FacilityEntity)
    private facilityRepo: Repository<FacilityEntity>,
  ) {}

  async createNewFacility(
    facility: FacilityUpdateRequestDto,
  ): Promise<Facility> {
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

  async updateFacility(
    streamId: string,
    update: Partial<FacilityUpdateRequestDto>,
  ): Promise<Facility> {
    const updateEvent: NewEvent<UpdateFacilityEvent> = {
      streamId,
      type: 'UpdateFacility',
      typeVersion: 1,
      eventData: update,
    }
    await this.eventService.saveEvent(updateEvent)

    const existingFacility = await this.facilityRepo.findOne({
      where: { streamId },
    })

    if (existingFacility === null) {
      throw new Error('facility not found')
    }

    const updatedFacility = await this.facilityRepo.save({
      ...existingFacility,
      ...update,
    })
    return updatedFacility
  }

  async getFacilityEvents(streamId: string): Promise<EventEntity<Event>[]> {
    const events = await this.eventService.getEvents(streamId)
    return events
  }
}

export default FacilityService
