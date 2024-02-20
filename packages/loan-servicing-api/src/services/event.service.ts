import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectDataSource } from '@nestjs/typeorm'
import { LoanServicingEvent } from 'loan-servicing-common'
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
  async initialiseEvent<T extends LoanServicingEvent = never>(
    streamId: string,
    streamVersion: number,
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

    if (event.streamVersion !== streamVersion + 1) {
      throw new BadRequestException(
        `Stream ${streamId} has an updated version, please refresh your data`,
      )
    }
    return event
  }

  @Transactional()
  async saveEvent<T extends LoanServicingEvent>(
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
    event.eventDate = new Date()
    const result = await repo.save(event)
    return result
  }

  @Transactional({ propagation: Propagation.SUPPORTS })
  getEventsInOrder(
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
