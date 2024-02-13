import { Injectable } from '@nestjs/common'
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import Event from 'models/entities/Event'
import BaseEvent from 'models/events/BaseEvent'

@Injectable()
class EventService {
  constructor(
    @InjectRepository(Event<BaseEvent>) private eventRepo: Repository<Event<BaseEvent>>,
  ) {}

  async saveEvent<T extends BaseEvent>(eventData: T) {
    const event = new Event<T>()
    event.streamId = 1 // get valid stream id and version
    event.streamVersion = 1
    event.eventData = eventData
    const result = await this.eventRepo.save(event)
    return result
  }

  getEvents(streamId: number) {
    return this.eventRepo.find({ where: { streamId } })
  }
}

export default EventService
