import { Inject, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import {
  Facility,
  CreateNewParticipationEvent,
  NewParticipationRequestDto,
  AddParticipationToFacilityEvent,
} from 'loan-servicing-common'
import FacilityEntity from 'models/entities/FacilityEntity'
import EventService from 'modules/event/event.service'
import ProjectionsService from 'modules/projections/projections.service'
import SystemValueService from 'modules/systemValue/systemValue.service'
import { Repository } from 'typeorm'
import { Transactional } from 'typeorm-transactional'

@Injectable()
class ParticipationService {
  constructor(
    @Inject(EventService) private eventService: EventService,
    @InjectRepository(FacilityEntity)
    private facilityRepo: Repository<FacilityEntity>,
    @Inject(ProjectionsService)
    private projectionsService: ProjectionsService,
    @Inject(SystemValueService)
    private systemValueService: SystemValueService,
  ) {}

  @Transactional()
  async createNewParticipation(
    participationRequest: NewParticipationRequestDto,
    parentFacilityId: string,
    parentFacilityVersion: number,
  ): Promise<Facility> {
    const newParticipationId = crypto.randomUUID()
    const savedRootEvent =
      await this.eventService.addEvent<CreateNewParticipationEvent>({
        streamId: newParticipationId,
        effectiveDate: participationRequest.issuedEffectiveDate,
        entityType: 'participation',
        shouldProcessIfFuture: false,
        type: 'CreateNewParticipation',
        typeVersion: 1,
        eventData: {
          ...participationRequest,
          parentFacilityId,
        },
        isApproved: true,
      })

    await this.eventService.addEvent<AddParticipationToFacilityEvent>(
      {
        streamId: parentFacilityId,
        effectiveDate: participationRequest.issuedEffectiveDate,
        entityType: 'participation',
        shouldProcessIfFuture: false,
        type: 'AddParticipationToFacility',
        typeVersion: 1,
        eventData: {
          participantShare: participationRequest.participantShare,
          parentFacilityId,
          participationFacilityId: newParticipationId,
        },
        isApproved: true,
      },
      parentFacilityVersion,
    )

    const { facility } =
      await this.projectionsService.buildProjectionsForFacility(
        savedRootEvent.streamId,
      )

    return facility
  }
}

export default ParticipationService
