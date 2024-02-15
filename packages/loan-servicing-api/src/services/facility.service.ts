import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import {
  CreateNewFacilityEvent,
  UpdateFacilityEvent,
} from 'models/events/facilityEvents'
import Event, { NewEvent } from 'models/events'
import { InjectRepository } from '@nestjs/typeorm'
import FacilityEntity from 'models/entities/FacilityEntity'
import { Repository } from 'typeorm'
import { Facility, NewFacilityRequestDto } from 'loan-servicing-common'
import EventEntity from 'models/entities/EventEntity'
import { Transactional } from 'typeorm-transactional'
import EventService from './event.service'

@Injectable()
class FacilityService {
  constructor(
    @Inject(EventService) private eventService: EventService,
    @InjectRepository(FacilityEntity)
    private facilityRepo: Repository<FacilityEntity>,
  ) {}

  @Transactional()
  async createNewFacility(facility: NewFacilityRequestDto): Promise<Facility> {
    let updatedProjection
    for (let i = 0; i < 10; i++) {
      const createFacilityEvent: NewEvent<CreateNewFacilityEvent> = {
        streamId: crypto.randomUUID(),
        type: 'CreateNewFacility',
        typeVersion: 1,
        eventData: facility,
      }
      const savedEvent = await this.eventService.saveEvent(createFacilityEvent)

      updatedProjection = await this.facilityRepo.create({
        ...savedEvent.eventData,
        streamId: savedEvent.streamId,
      })
      await this.facilityRepo.save(updatedProjection)
    }

    return updatedProjection
  }

  @Transactional()
  async updateFacility(
    streamId: string,
    update: Partial<NewFacilityRequestDto>,
  ): Promise<Facility> {
    const updateEvent: NewEvent<UpdateFacilityEvent> = await this.eventService.initialiseEvent<UpdateFacilityEvent>({
      streamId,
      type: 'UpdateFacility',
      typeVersion: 1,
      eventData: {}
    })

    const existingFacilityEvents =
      await this.eventService.getEventsInOrder(streamId)

    if (existingFacilityEvents.length === 0) {
      throw new NotFoundException()
    }

    const existingFacility = this.getFacilityFromEvents(existingFacilityEvents)

    await this.eventService.saveEvent(updateEvent)

    const updatedFacility = await this.facilityRepo.save({
      ...existingFacility,
      ...update,
    })
    return updatedFacility
  }

  @Transactional()
  async incrementFacilityValue(streamId: string): Promise<Facility> {
    const updateEvent: NewEvent<UpdateFacilityEvent> = await this.eventService.initialiseEvent<UpdateFacilityEvent>({
      streamId,
      type: 'UpdateFacility',
      typeVersion: 1,
      eventData: {}
    })
    const currentFacility = await this.getFacility(streamId)
    if (!currentFacility) {
      throw new NotFoundException()
    }
    updateEvent.eventData = {
      facilityAmount: currentFacility.facilityAmount + 1,
    }
    await this.eventService.saveEvent(updateEvent)
    const updatedFacility = await this.facilityRepo.save({
      ...currentFacility,
      ...updateEvent.eventData,
    })
    return updatedFacility
  }

  @Transactional()
  async getFacilityEvents(streamId: string): Promise<EventEntity<Event>[]> {
    const events = await this.eventService.getEventsInOrder(streamId)
    return events
  }

  @Transactional()
  async getFacility(streamId: string): Promise<Facility | null> {
    const events = await this.getFacilityEvents(streamId)
    return this.getFacilityFromEvents(events)
  }

  async getAllFacilities(): Promise<Facility[] | null> {
    return this.facilityRepo.find()
  }

  getFacilityFromEvents(events: EventEntity<Event>[]): Facility {
    const create = events[0] as CreateNewFacilityEvent
    const updates = events.slice(1) as UpdateFacilityEvent[]
    const result: Facility =  updates.reduce((facility, update) => ({ ...facility, ...update.eventData }), {
      streamId: create.streamId,
      ...create.eventData,
    })
    return result
  }
}

export default FacilityService
