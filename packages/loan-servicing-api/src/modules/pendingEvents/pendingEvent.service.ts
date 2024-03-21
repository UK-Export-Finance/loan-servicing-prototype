import { Injectable } from '@nestjs/common'
import { InjectDataSource } from '@nestjs/typeorm'
import { instanceToPlain, plainToInstance } from 'class-transformer'
import { LoanServicingEvent, PendingEvent } from 'loan-servicing-common'
import eventTypeToEventClassDefinition, {
  GetClassConstructorForEventData,
} from 'models/dtos'
import PendingEventEntity from 'models/entities/PendingEventEntity'
import { DataSource } from 'typeorm'
import { Propagation, Transactional } from 'typeorm-transactional'

export type NewPendingEvent<T extends LoanServicingEvent> = Omit<
  PendingEventEntity<T>,
  'id' | 'eventDate'
>

@Injectable()
class PendingEventService {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  @Transactional()
  async addPendingEvents(
    events: NewPendingEvent<LoanServicingEvent>[],
  ): Promise<PendingEventEntity<LoanServicingEvent>[]> {
    return Promise.all(events.map(async (e) => this.addPendingEvent(e)))
  }

  @Transactional()
  // Default to never to enforce passing a type to T in all cases
  async addPendingEvent<T extends LoanServicingEvent = never>(
    event: NewPendingEvent<T>,
  ): Promise<PendingEventEntity<T>> {
    const repo = this.dataSource.getRepository(PendingEventEntity<T>)

    const createdEvent = await repo.create({ ...event, eventDate: new Date() })

    return repo.save(createdEvent)
  }

  @Transactional({ propagation: Propagation.SUPPORTS })
  async getPendingEventsInCreationOrder(
    streamId: string,
  ): Promise<PendingEvent<LoanServicingEvent>[]> {
    const repo = this.dataSource.getRepository(
      PendingEventEntity<LoanServicingEvent>,
    )
    const result = await repo
      .createQueryBuilder('e')
      .where({ streamId })
      .orderBy({ 'e.streamVersion': 'ASC' })
      .getMany()
    const transformed = result.map(this.parseEvent)
    return transformed
  }

  @Transactional()
  async clearPendingEvents(streamId: string): Promise<void> {
    const repo = this.dataSource.getRepository(
      PendingEventEntity<LoanServicingEvent>,
    )
    await repo.delete({ streamId })
  }

  parseEvent<T extends LoanServicingEvent>(
    rawEvent: PendingEventEntity<T>,
  ): PendingEvent<T> {
    const getClassConstructor = eventTypeToEventClassDefinition[
      rawEvent.type
    ] as unknown as GetClassConstructorForEventData<T['eventData']>
    const classConstructor = getClassConstructor(rawEvent.eventData)

    const eventData = plainToInstance(classConstructor, rawEvent.eventData)
    return {
      ...instanceToPlain(rawEvent),
      eventData,
    } as PendingEvent<T>
  }

  tryParseEvent<T extends LoanServicingEvent>(
    rawEvent: PendingEventEntity<T> | null,
  ): PendingEvent<T> | null {
    if (!rawEvent) {
      return null
    }
    return this.parseEvent(rawEvent)
  }
}

export default PendingEventService
