import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectDataSource } from '@nestjs/typeorm'
import { instanceToPlain, plainToInstance } from 'class-transformer'
import {
  CreateNewFacilityEvent,
  LoanServicingEvent,
} from 'loan-servicing-common'
import eventTypeToEventClassDefinition, {
  GetClassConstructorForEventData,
} from 'models/dtos'
import EventEntity from 'models/entities/EventEntity'
import { DataSource, FindOptionsWhere } from 'typeorm'
import { Propagation, Transactional } from 'typeorm-transactional'

export type NewEvent<T extends LoanServicingEvent> = Omit<
  EventEntity<T>,
  'id' | 'eventDate' | 'streamVersion' | 'isSoftDeleted'
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
      // .setLock('pessimistic_write')
      .select('MAX(e.streamVersion)', 'value')
      .getRawOne<{ value: number }>()

    const currentStreamVersion = maxStreamVersionResult?.value ?? 0

    if (currentStreamVersion !== lastSeenStreamVersion) {
      throw new BadRequestException(
        `Stream ${event.streamId} is on version ${currentStreamVersion}, the last version you saw was ${lastSeenStreamVersion}. Update your data`,
      )
    }

    const eventToCreate: Omit<EventEntity<T>, 'id'> = {
      ...event,
      isSoftDeleted: false,
      streamVersion: currentStreamVersion + 1,
      eventDate: new Date(),
    }

    const createdEvent = await repo.create(eventToCreate)

    return repo.save(createdEvent)
  }

  @Transactional({ propagation: Propagation.SUPPORTS })
  async getActiveEventsInCreationOrder(
    streamId: string,
  ): Promise<LoanServicingEvent[]> {
    const repo = this.dataSource.getRepository(EventEntity<LoanServicingEvent>)
    const result = await repo
      .createQueryBuilder('e')
      .where({ streamId, isSoftDeleted: false })
      .orderBy({ 'e.streamVersion': 'ASC' })
      .getMany()
    const transformed = result.map(this.parseEvent)
    return transformed
  }

  @Transactional({ propagation: Propagation.SUPPORTS })
  async getActiveEventsInEffectiveOrder(
    streamId: string,
  ): Promise<LoanServicingEvent[]> {
    const repo = this.dataSource.getRepository(EventEntity<LoanServicingEvent>)
    const result = await repo
      .createQueryBuilder('e')
      .where({ streamId })
      .orderBy({ 'e.effectiveDate': 'ASC' })
      .getMany()
    return result.map(this.parseEvent)
  }

  @Transactional()
  async softDeleteEventsWhere(
    findOptions: FindOptionsWhere<EventEntity<LoanServicingEvent>>,
  ): Promise<void> {
    const repo = this.dataSource.getRepository(EventEntity<LoanServicingEvent>)
    const event = await repo.findBy(findOptions)
    event.forEach((e) => {
      e.isSoftDeleted = true
    })
    await repo.save(event)
  }

  async getFacilityTypeOfEventStream(streamId: string): Promise<string> {
    const repo = this.dataSource.getRepository(
      EventEntity<CreateNewFacilityEvent>,
    )
    const eventRaw = await repo.findOne({ where: { streamId } })
    const event = this.tryParseEvent(eventRaw)
    if (!event) {
      throw new Error(`No facility found with id ${streamId}`)
    }
    return event.eventData.facilityType
  }

  parseEvent<T extends LoanServicingEvent>(rawEvent: EventEntity<T>): T {
    const getClassConstructor = eventTypeToEventClassDefinition[
      rawEvent.type
    ] as unknown as GetClassConstructorForEventData<T>
    const classConstructor = getClassConstructor(rawEvent)

    const eventData = plainToInstance(classConstructor, rawEvent.eventData)
    return {
      ...instanceToPlain(rawEvent),
      eventData,
    } as T
  }

  tryParseEvent<T extends LoanServicingEvent>(
    rawEvent: EventEntity<T> | null,
  ): T | null {
    if (!rawEvent) {
      return null
    }
    return this.parseEvent(rawEvent)
  }
}

export default EventService
