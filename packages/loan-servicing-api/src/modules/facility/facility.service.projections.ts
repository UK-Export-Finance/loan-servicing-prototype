/* eslint-disable no-param-reassign */
import { Injectable, Inject, NotImplementedException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Transactional } from 'typeorm-transactional'
import {
  CreateNewFacilityEvent,
  AdjustFacilityAmountEvent,
  LoanServicingEvent,
  Facility,
  FacilityEvent,
} from 'loan-servicing-common'
import EventEntity from 'models/entities/EventEntity'
import EventService from 'modules/event/event.service'
import Big from 'big.js'
import FacilityEntity from 'models/entities/FacilityEntity'

@Injectable()
class FacilityProjectionsService {
  constructor(
    @Inject(EventService) private eventService: EventService,
    @InjectRepository(FacilityEntity)
    private facilityRepo: Repository<FacilityEntity>,
  ) {}

  @Transactional()
  async buildProjections(facilityStreamId: string): Promise<Facility> {
    await this.facilityRepo.delete({ streamId: facilityStreamId })

    const facilityEvents = (await this.eventService.getEventsInCreationOrder(
      facilityStreamId,
    )) as FacilityEvent[]

    const facility = this.getFacilityAtCreation(facilityEvents)

    facilityEvents.forEach((e) => this.applyEventToFacility(e, facility))

    facility.streamVersion =
      facilityEvents[facilityEvents.length - 1].streamVersion

    await this.facilityRepo.save(facility)

    return facility
  }

  getFacilityAtCreation = (facilityEvents: LoanServicingEvent[]): Facility => {
    const creationEvent =
      facilityEvents[0] as EventEntity<CreateNewFacilityEvent>

    if (creationEvent.type !== 'CreateNewFacility') {
      throw new Error('First created event is not facility creation')
    }

    return this.facilityRepo.create({
      streamId: creationEvent.streamId,
      streamVersion: 1,
      ...creationEvent.eventData,
    })
  }

  applyEventToFacility = (
    event: FacilityEvent,
    facilityEntity: Facility,
  ): void => {
    switch (event.type) {
      case 'CreateNewFacility':
        return
      case 'AdjustFacilityAmount':
        const { eventData: incrementEvent } = event as AdjustFacilityAmountEvent
        facilityEntity.facilityAmount = Big(facilityEntity.facilityAmount)
          .add(incrementEvent.adjustment)
          .toFixed(2)
        return
      default:
        throw new NotImplementedException()
    }
  }
}

export default FacilityProjectionsService
