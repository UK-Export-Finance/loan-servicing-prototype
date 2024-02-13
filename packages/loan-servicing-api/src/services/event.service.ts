import { Injectable } from '@nestjs/common'
import { InjectDataSource,  } from '@nestjs/typeorm'
import EventEntity from 'models/entities/EventEntity'
import Event, { NewEvent } from 'models/events'
import { DataSource } from 'typeorm'

@Injectable()
class EventService {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  async saveEvent<T extends Event>(newEvent: NewEvent<T>): Promise<EventEntity<T>> {
    const repo = this.dataSource.getRepository(EventEntity<T>)
    const event = await repo.create(newEvent)
    event.streamVersion = 1
    const result = await repo.save(event)
    return result 
  }

  getEvents(streamId: string): Promise<EventEntity<Event>[]> {
    const repo = this.dataSource.getRepository(EventEntity<Event>)
    return repo.find({ where: { streamId } })
  }
}

export default EventService
