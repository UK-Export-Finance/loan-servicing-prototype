import { Inject, Injectable, NotImplementedException } from '@nestjs/common'
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm'
import { instanceToPlain, plainToInstance } from 'class-transformer'
import {
  LoanServicingEvent,
  NotificationText,
  PendingEvent,
  RecordDrawingAccrualPaymentEvent,
  RecordDrawingRepaymentEvent,
} from 'loan-servicing-common'
import eventTypeToEventClassDefinition, {
  GetClassConstructorForEventData,
} from 'models/dtos'
import DrawingEntity from 'models/entities/DrawingEntity'
import PendingEventEntity from 'models/entities/PendingEventEntity'
import SystemValueService from 'modules/systemValue/systemValue.service'
import { DataSource, Repository } from 'typeorm'
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
    @Inject(SystemValueService) private systemValueService: SystemValueService,
    @InjectRepository(DrawingEntity)
    private drawingRepo: Repository<DrawingEntity>,
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

  @Transactional({ propagation: Propagation.SUPPORTS })
  async getEventsWithNotificationsToday(): Promise<
    PendingEvent<LoanServicingEvent>[]
  > {
    const repo = this.dataSource.getRepository(
      PendingEventEntity<LoanServicingEvent>,
    )
    const today = await this.systemValueService.getSystemDate()
    const todayDate = new Date(today.toDateString())
    const result = await repo.findBy([
      { notificationDate: todayDate },
      { dueDate: todayDate },
    ])
    const transformed = result.map(this.parseEvent)
    return transformed
  }

  async mapPendingEventToNotification(
    event: PendingEvent<LoanServicingEvent>,
  ): Promise<NotificationText> {
    const today = await this.systemValueService.getSystemDate()
    const isOverdue = event.dueDate < today
    let paymentAmount

    switch (event.type) {
      case 'RecordDrawingAccrualPayment':
        paymentAmount = (
          event as PendingEvent<RecordDrawingAccrualPaymentEvent>
        ).eventData.amount
        break
      case 'RecordDrawingRepayment':
        paymentAmount = (event as PendingEvent<RecordDrawingRepaymentEvent>)
          .eventData.amount
        break
      default:
        throw new NotImplementedException()
    }
    const drawingForNotification = await this.drawingRepo.findOneOrFail({
      where: { streamId: event.streamId },
      relations: { facility: true },
    })
    const drawingUrl = `${process.env.UI_URL}/facility/${drawingForNotification.facility.streamId}/drawing/${event.streamId}`
    return {
      type: 'mrkdwn',
      text: `${event.type} of ${paymentAmount} is ${isOverdue ? 'OVERDUE' : 'due'} on a <${drawingUrl}|drawing> on ${event.dueDate.toLocaleDateString()}`,
    }
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
