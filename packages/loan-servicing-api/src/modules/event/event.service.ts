import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectDataSource } from '@nestjs/typeorm'
import { LoanServicingEvent } from 'loan-servicing-common'
import EventEntity from 'models/entities/EventEntity'
import { DataSource } from 'typeorm'
import { Propagation, Transactional } from 'typeorm-transactional'

export type NewEvent<T extends LoanServicingEvent> = Omit<
  EventEntity<T>,
  'id' | 'eventDate' | 'streamVersion'
>

@Injectable()
class EventService {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  @Transactional()
  // Default to never to enforce passing a type to T in all cases
  async addEvent<T extends LoanServicingEvent = never>(
    event: NewEvent<T>,
    lastSeenStreamVersion: number = 0, // Default to 0 when creating new streams
  ): Promise<EventEntity<T>> {
    const repo = this.dataSource.getRepository(EventEntity<T>)

    const maxStreamVersionResult = await repo
      .createQueryBuilder('e')
      .where({ streamId: event.streamId })
      // Prevents another event being written to this stream until transaction is complete
      .setLock('pessimistic_write')
      .select('MAX(e.streamVersion)', 'value')
      .getRawOne<{ value: number }>()

    const currentStreamVersion = maxStreamVersionResult?.value ?? 0

    if (currentStreamVersion !== lastSeenStreamVersion) {
      throw new BadRequestException(
        `Stream ${event.streamId} has an updated version, please refresh your data`,
      )
    }

    const createdEvent = await repo.create({
      ...event,
      streamVersion: currentStreamVersion + 1,
      eventDate: new Date(),
    })

    return repo.save(createdEvent)
  }

  @Transactional({ propagation: Propagation.SUPPORTS })
  getEventsInCreationOrder(
    streamId: string,
  ): Promise<EventEntity<LoanServicingEvent>[]> {
    const repo = this.dataSource.getRepository(EventEntity<LoanServicingEvent>)
    return repo
      .createQueryBuilder('e')
      .where({ streamId })
      .orderBy({ 'e.streamVersion': 'ASC' })
      .getMany()
  }

  @Transactional({ propagation: Propagation.SUPPORTS })
  getEventsInEffectiveOrder(
    streamId: string,
  ): Promise<EventEntity<LoanServicingEvent>[]> {
    const repo = this.dataSource.getRepository(EventEntity<LoanServicingEvent>)
    return repo
      .createQueryBuilder('e')
      .where({ streamId })
      .orderBy({ 'e.effectiveDate': 'ASC' })
      .getMany()
  }
}

export default EventService
