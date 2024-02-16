import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import {
  CreateNewFacilityEvent,
  UpdateFacilityEvent,
} from 'models/events/facilityEvents'
import Event from 'models/events'
import { InjectRepository } from '@nestjs/typeorm'
import FacilityEntity from 'models/entities/FacilityEntity'
import { Repository } from 'typeorm'
import { Facility, NewFacilityRequestDto } from 'loan-servicing-common'
import EventEntity from 'models/entities/EventEntity'
import { Propagation, Transactional } from 'typeorm-transactional'
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
    const createFacilityEvent: CreateNewFacilityEvent = {
      streamId: crypto.randomUUID(),
      streamVersion: 1,
      type: 'CreateNewFacility',
      typeVersion: 1,
      eventData: facility,
    }
    const savedEvent = await this.eventService.saveEvent(createFacilityEvent)
    const projection = await this.facilityRepo.create({
      ...savedEvent.eventData,
      streamId: savedEvent.streamId,
      streamVersion: 1,
    })
    await this.facilityRepo.save(projection)

    return projection
  }

  @Transactional()
  async updateFacility(
    streamId: string,
    streamVersion: number,
    update: Partial<NewFacilityRequestDto>,
  ): Promise<Facility> {
    const updateEvent =
      await this.eventService.initialiseEvent<UpdateFacilityEvent>(
        streamId,
        'UpdateFacility',
        1,
      )

    updateEvent.eventData = update

    if (updateEvent.streamVersion !== streamVersion + 1) {
      throw new BadRequestException(
        `Stream ${streamId} has an updated version, please refresh your data`,
      )
    }

    const existingFacility = await this.getFacility(streamId)

    await this.eventService.saveEvent(updateEvent)

    const updatedFacility = await this.facilityRepo.save({
      ...existingFacility,
      ...update,
      streamVersion: updateEvent.streamVersion,
    })
    return updatedFacility
  }

  @Transactional()
  async incrementFacilityValue(streamId: string): Promise<Facility> {
    const updateEvent =
      await this.eventService.initialiseEvent<UpdateFacilityEvent>(
        streamId,
        'UpdateFacility',
        1,
      )

    const currentFacility = await this.getFacility(streamId)

    updateEvent.eventData = {
      facilityAmount: currentFacility.facilityAmount + 1,
    }

    const updatedFacility = await this.facilityRepo.save({
      ...currentFacility,
      ...updateEvent.eventData,
    })

    await this.eventService.saveEvent(updateEvent)
    return updatedFacility
  }

  @Transactional({ propagation: Propagation.SUPPORTS })
  async getFacilityEvents(streamId: string): Promise<EventEntity<Event>[]> {
    const events = await this.eventService.getEventsInOrder(streamId)
    return events
  }

  @Transactional({ propagation: Propagation.SUPPORTS })
  async getFacility(streamId: string): Promise<Facility> {
    const events = await this.getFacilityEvents(streamId)
    if(events.length === 0){
      throw new NotFoundException(`No facility found for id ${streamId}`)

    }
    return this.getFacilityFromEvents(events)
  }

  async getAllFacilities(): Promise<Facility[] | null> {
    return this.facilityRepo.find()
  }

  getFacilityFromEvents(events: EventEntity<Event>[]): Facility {
    const create = events[0] as CreateNewFacilityEvent
    const updates = events.slice(1) as UpdateFacilityEvent[]
    const result: Facility = updates.reduce(
      (facility, update) => ({
        ...facility,
        ...update.eventData,
        streamVersion: update.streamVersion,
      }),
      {
        streamId: create.streamId,
        streamVersion: create.streamVersion,
        ...create.eventData,
      },
    )
    return result
  }
}

export default FacilityService
