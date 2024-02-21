import {
  Inject,
  Injectable,
  NotFoundException,
  NotImplementedException,
} from '@nestjs/common'
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
import EventEntity from 'models/entities/EventEntity'
import { Propagation, Transactional } from 'typeorm-transactional'
import EventService from './event.service'
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
    eventEffectiveDate: Date,
  ): Promise<Facility> {
    await this.eventService.addEvent<UpdateInterestEvent>(
      {
        streamId,
        effectiveDate: eventEffectiveDate,
        type: 'UpdateInterest',
        typeVersion: 1,
        eventData: update,
      },
      streamVersion,
    )
    
    const { facility } = await this.projectionsService.buildProjections(streamId)
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
    const { facility } = await this.projectionsService.buildProjections(streamId)
    return facility
  }

  @Transactional({ propagation: Propagation.SUPPORTS })
  async getFacilityEvents(
    streamId: string,
  ): Promise<EventEntity<LoanServicingEvent>[]> {
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

  async updateFacilityProjection(
    streamId: string,
    update: Partial<Facility>,
  ): Promise<Facility> {
    const facilityEntity = await this.getFacility(streamId)
    Object.assign(facilityEntity, update)
    return this.facilityRepo.save(facilityEntity)
  }

  async getAllFacilities(): Promise<Facility[] | null> {
    return this.facilityRepo.find()
  }

  getFacilityFromEvents(events: EventEntity<LoanServicingEvent>[]): Facility {
    const create = events[0] as CreateNewFacilityEvent
    const updates = events.slice(1)
    const result: Facility = updates.reduce(
      (facility, update) => {
        if (update.type === 'UpdateInterest') {
          return {
            ...facility,
            ...update.eventData,
            streamVersion: update.streamVersion,
          }
        }
        if (update.type === 'AdjustFacilityPrincipal') {
          const { eventData } = update as AdjustFacilityPrincipalEvent
          return {
            ...facility,
            streamVersion: update.streamVersion,
            facilityAmount: facility.facilityAmount + eventData.adjustment,
          }
        }
        throw new NotImplementedException()
      },
      {
        streamId: create.streamId,
        streamVersion: create.streamVersion,
        ...create.eventData,
      },
    )
    return result
  }
}

export default FacilityService
