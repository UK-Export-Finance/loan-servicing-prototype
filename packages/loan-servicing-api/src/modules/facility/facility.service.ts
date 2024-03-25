import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import {
  CreateNewFacilityEvent,
  LoanServicingEvent,
  NewFacilityRequestDto,
  AdjustFacilityAmountEvent,
  AdjustFacilityAmountDto,
  Facility,
  AddFixedFacilityFeeDto,
  AddFacilityFeeEvent,
  AddAccruingFacilityFeeDto,
} from 'loan-servicing-common'
import { Propagation, Transactional } from 'typeorm-transactional'
import EventService from 'modules/event/event.service'
import FacilityEntity from 'models/entities/FacilityEntity'
import ProjectionsService from 'modules/projections/projections.service'

@Injectable()
class FacilityService {
  constructor(
    @Inject(EventService) private eventService: EventService,
    @InjectRepository(FacilityEntity)
    private facilityRepo: Repository<FacilityEntity>,
    @Inject(ProjectionsService)
    private projectionsService: ProjectionsService,
  ) {}

  @Transactional()
  async createNewFacility(
    facilityRequest: NewFacilityRequestDto,
  ): Promise<Facility> {
    const savedEvent = await this.eventService.addEvent<CreateNewFacilityEvent>(
      {
        streamId: crypto.randomUUID(),
        effectiveDate: facilityRequest.issuedEffectiveDate,
        entityType: 'facility',
        shouldProcessIfFuture: false,
        type: 'CreateNewFacility',
        typeVersion: 1,
        eventData: facilityRequest,
      },
    )
    const { facility } =
      await this.projectionsService.buildProjectionsForFacility(
        savedEvent.streamId,
      )

    return facility
  }

  @Transactional()
  async adjustFacilityAmount(
    streamId: string,
    streamVersion: number,
    { effectiveDate, adjustment }: AdjustFacilityAmountDto,
  ): Promise<Facility> {
    await this.eventService.addEvent<AdjustFacilityAmountEvent>(
      {
        streamId,
        effectiveDate: new Date(effectiveDate),
        entityType: 'facility',
        shouldProcessIfFuture: false,
        type: 'AdjustFacilityAmount',
        typeVersion: 1,
        eventData: { adjustment },
      },
      streamVersion,
    )
    const { facility } =
      await this.projectionsService.buildProjectionsForFacility(streamId)
    return facility
  }

  @Transactional()
  async addFacilityFee(
    streamId: string,
    streamVersion: number,
    feeConfig: AddFixedFacilityFeeDto | AddAccruingFacilityFeeDto,
  ): Promise<Facility> {
    await this.eventService.addEvent<AddFacilityFeeEvent>(
      {
        streamId,
        effectiveDate: feeConfig.effectiveDate,
        entityType: 'facility',
        type: 'AddFacilityFee',
        shouldProcessIfFuture: true,
        typeVersion: 1,
        eventData: { ...feeConfig, feeId: crypto.randomUUID() },
      },
      streamVersion,
    )
    const { facility } =
      await this.projectionsService.buildProjectionsForFacility(streamId)
    return facility
  }

  @Transactional({ propagation: Propagation.SUPPORTS })
  async getFacilityEvents(streamId: string): Promise<LoanServicingEvent[]> {
    const events =
      await this.eventService.getActiveEventsInCreationOrder(streamId)
    return events
  }

  @Transactional({ propagation: Propagation.SUPPORTS })
  async getFacility(streamId: string): Promise<Facility> {
    const facility = await this.facilityRepo.findOne({ where: { streamId } })
    if (!facility) {
      throw new NotFoundException(`No facility found for id ${streamId}`)
    }
    return facility
  }

  async getAllFacilities(): Promise<Facility[] | null> {
    return this.facilityRepo.find()
  }
}

export default FacilityService
