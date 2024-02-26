import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import FacilityEntity from 'models/entities/FacilityEntity'
import { Repository } from 'typeorm'
import {
  CreateNewFacilityEvent,
  LoanServicingEvent,
  Facility,
  NewFacilityRequestDto,
  UpdateInterestEvent,
  AdjustFacilityPrincipalEvent,
  AdjustFacilityPrincipalDto,
  UpdateInterestRequestDto,
} from 'loan-servicing-common'
import { Propagation, Transactional } from 'typeorm-transactional'
import EventService from 'modules/event/event.service'
import FacilityProjectionsService from './facilityProjections.service'

@Injectable()
class FacilityService {
  constructor(
    @Inject(EventService) private eventService: EventService,
    @InjectRepository(FacilityEntity)
    private facilityRepo: Repository<FacilityEntity>,
    @Inject(FacilityProjectionsService)
    private projectionsService: FacilityProjectionsService,
  ) {}

  @Transactional()
  async createNewFacility(
    facilityRequest: NewFacilityRequestDto,
  ): Promise<Facility> {
    const savedEvent = await this.eventService.addEvent<CreateNewFacilityEvent>(
      {
        streamId: crypto.randomUUID(),
        effectiveDate: facilityRequest.issuedEffectiveDate,
        type: 'CreateNewFacility',
        typeVersion: 1,
        eventData: facilityRequest,
      },
    )
    const { facility } = await this.projectionsService.buildProjections(
      savedEvent.streamId,
    )

    return facility
  }

  @Transactional()
  async updateFacility(
    streamId: string,
    streamVersion: number,
    update: UpdateInterestRequestDto,
  ): Promise<Facility> {
    await this.eventService.addEvent<UpdateInterestEvent>(
      {
        streamId,
        effectiveDate: new Date(update.effectiveDate),
        type: 'UpdateInterest',
        typeVersion: 1,
        eventData: update,
      },
      streamVersion,
    )

    const { facility } =
      await this.projectionsService.buildProjections(streamId)
    return facility
  }

  @Transactional()
  async adjustFacilityPrincipal(
    streamId: string,
    streamVersion: number,
    { effectiveDate, adjustment }: AdjustFacilityPrincipalDto,
  ): Promise<Facility> {
    await this.eventService.addEvent<AdjustFacilityPrincipalEvent>(
      {
        streamId,
        effectiveDate: new Date(effectiveDate),
        type: 'AdjustFacilityPrincipal',
        typeVersion: 1,
        eventData: { adjustment },
      },
      streamVersion,
    )
    const { facility } =
      await this.projectionsService.buildProjections(streamId)
    return facility
  }

  @Transactional({ propagation: Propagation.SUPPORTS })
  async getFacilityEvents(streamId: string): Promise<LoanServicingEvent[]> {
    const events = await this.eventService.getEventsInCreationOrder(streamId)
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

  async recalculateFacilitiesOfType(facilityType: string): Promise<void> {
    const facilities = await this.facilityRepo.find({where: {facilityType}})
    const updates = facilities.map(f => this.projectionsService.buildProjections(f.streamId))
    await Promise.all(updates)
  }
}

export default FacilityService
