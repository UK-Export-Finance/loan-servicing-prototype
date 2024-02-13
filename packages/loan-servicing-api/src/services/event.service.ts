import { Injectable } from '@nestjs/common'
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import EventEntity from 'models/entities/EventEntity'
import { UntypedEvent } from 'models/interfaces/event'
import Event, { EventRequest } from 'models/events'

@Injectable()
class EventService {
  constructor(
    @InjectRepository(EventEntity<UntypedEvent>)
    private eventRepo: Repository<EventEntity<UntypedEvent>>,
  ) {}

  async saveEvent({
    type,
    typeVersion,
    eventData,
  }: EventRequest<Event>) {
    const event = new EventEntity()
    event.streamId = 1 // get valid stream id and version
    event.streamVersion = 1
    event.type = type
    event.typeVersion = typeVersion
    event.eventData = eventData
    const result = await this.eventRepo.save(event)
    return result
  }

  getEvents(streamId: number) {
    return this.eventRepo.find({ where: { streamId } })
  }
}

export default EventService
