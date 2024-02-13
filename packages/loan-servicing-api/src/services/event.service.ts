import { Injectable } from '@nestjs/common'
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import EventEntity from 'models/entities/EventEntity'
import Event, { EventRequest } from 'models/events'

@Injectable()
class EventService {
  constructor(
    @InjectRepository(EventEntity<Event>)
    private eventRepo: Repository<EventEntity<Event>>,
  ) {}

  async saveEvent<T extends Event>({
    type,
    typeVersion,
    eventData,
  }: EventRequest<T>): Promise<T['eventData']> {
    const event = new EventEntity()
    event.streamId = 1 // get valid stream id and version
    event.streamVersion = 1
    event.type = type
    event.typeVersion = typeVersion
    event.eventData = eventData
    const result = await this.eventRepo.save(event)
    return result.eventData
  }

  getEvents(streamId: number) {
    return this.eventRepo.find({ where: { streamId } })
  }
}

export default EventService
