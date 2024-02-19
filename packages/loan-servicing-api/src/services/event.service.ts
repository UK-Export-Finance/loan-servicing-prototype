import { Injectable } from '@nestjs/common'
import { InjectDataSource } from '@nestjs/typeorm'
import { Event } from 'loan-servicing-common'
import EventEntity from 'models/entities/EventEntity'
import { DataSource } from 'typeorm'
import { Propagation, Transactional } from 'typeorm-transactional'

@Injectable()
class EventService {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  @Transactional()
  // Default to never to enforce passing a type to T in all cases
  async initialiseEvent<T extends Event = never>(
    streamId: string,
    // A little awkward but we need access to this at compile time
    type: T['type'],
    typeVersion: T['typeVersion'],
  ): Promise<EventEntity<T>> {
    const repo = this.dataSource.getRepository(EventEntity<T>)

    const { max } = await repo
      .createQueryBuilder('e')
      .where({ streamId })
      // Prevents another event being written to this stream until transaction is complete
      .setLock('pessimistic_write')
      .select('MAX(e.streamVersion)', 'max')
      .getRawOne()

    const event = await repo.create({
      streamId,
      type,
      typeVersion,
      streamVersion: max + 1,
    })
    event.streamVersion = max + 1
    return event
  }

  @Transactional()
  async saveEvent<T extends Event>(
    newEvent: T,
  ): Promise<EventEntity<T>> {
    const repo = this.dataSource.getRepository(EventEntity<T>)

    const { max } = await repo
      .createQueryBuilder('e')
      .where({ streamId: newEvent.streamId })
      .select('MAX(e.streamVersion)', 'max')
      .getRawOne()

    const event = await repo.create(newEvent)
    event.streamVersion = (max || 0) + 1
    const result = await repo.save(event)
    return result
  }

  @Transactional({ propagation: Propagation.SUPPORTS })
  getEventsInOrder(streamId: string): Promise<EventEntity<Event>[]> {
    const repo = this.dataSource.getRepository(EventEntity<Event>)
    return repo
      .createQueryBuilder('e')
      .where({ streamId })
      .orderBy({ 'e.streamVersion': 'ASC' })
      .getMany()
  }
}

export default EventService
