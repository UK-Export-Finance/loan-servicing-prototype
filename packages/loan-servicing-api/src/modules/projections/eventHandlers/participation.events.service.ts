import { Injectable, Inject } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import {
  AddParticipationToFacilityEvent,
  CreateNewParticipationEvent,
  ProjectEvent,
  ProjectedParticipationEvent,
} from 'loan-servicing-common'
import DrawingEntity from 'models/entities/DrawingEntity'
import TransactionEntity from 'models/entities/TransactionEntity'
import EventService from 'modules/event/event.service'
import PendingEventService from 'modules/pendingEvents/pendingEvent.service'
import StrategyService from 'modules/strategy/strategy.service'
import { Repository } from 'typeorm'
import { IEventHandlerService, EventHandler } from 'types/eventHandler'
import FacilityBuilder from 'modules/projections/builders/FacilityBuilder'
import RootFacilityBuilder from 'modules/projections/builders/RootFacilityBuilder'

@Injectable()
class ParticipationEventHandlingService
  implements IEventHandlerService<ProjectedParticipationEvent>
{
  constructor(
    @Inject(EventService) private eventService: EventService,
    @Inject(StrategyService) private strategyService: StrategyService,
    @Inject(PendingEventService)
    private pendingEventService: PendingEventService,
    @InjectRepository(TransactionEntity)
    private transactionRepo: Repository<TransactionEntity>,
    @InjectRepository(DrawingEntity)
    private drawingRepo: Repository<DrawingEntity>,
  ) {}

  applyEvent = async <T extends ProjectedParticipationEvent>(
    event: T,
    projection: FacilityBuilder,
  ): Promise<void> => {
    const handler = this[event.type] as EventHandler<T>
    await handler(event, projection)
  }

  CreateNewParticipation: EventHandler<
    ProjectEvent<CreateNewParticipationEvent>
  > = async (sourceEvent, projections) => {
    projections.addTransactions({
      streamId: projections.facility.streamId,
      sourceEvent,
      datetime: projections.facility.issuedEffectiveDate,
      reference: 'Participation Created',
      valueChanged: 'N/A',
      changeInValue: '0',
      valueAfterTransaction: '0',
      status: 'commited',
    })
  }

  AddParticipationToFacility: EventHandler<
    ProjectEvent<AddParticipationToFacilityEvent>
  > = async (sourceEvent, projections) => {
    ;(projections as RootFacilityBuilder).addParticipation(
      sourceEvent.eventData,
    )
    projections.addTransactions({
      streamId: projections.facility.streamId,
      sourceEvent,
      datetime: projections.facility.issuedEffectiveDate,
      reference: 'Participation Created',
      valueChanged: 'N/A',
      changeInValue: '0',
      valueAfterTransaction: '0',
      status: 'commited',
    })
  }
}

export default ParticipationEventHandlingService
