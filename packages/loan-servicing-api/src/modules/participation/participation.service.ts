import { Inject, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Facility, CreateNewParticipationEvent, NewParticipationRequestDto } from 'loan-servicing-common'
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
  ): Promise<Facility> {
    const savedEvent =
      await this.eventService.addEvent<CreateNewParticipationEvent>({
        streamId: crypto.randomUUID(),
        effectiveDate: participationRequest.issuedEffectiveDate,
        entityType: 'facility',
        shouldProcessIfFuture: false,
        type: 'CreateNewParticipation',
        typeVersion: 1,
        eventData: {
          ...participationRequest,
          parentFacilityId,
        },
        isApproved: true,
      })
    const { facility } =
      await this.projectionsService.buildProjectionsForFacility(
        savedEvent.streamId,
      )

    return facility
  }
}

export default ParticipationService
