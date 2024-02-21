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
  UpdateFacilityEvent,
  AdjustFacilityPrincipalEvent,
  AdjustFacilityPrincipalDto,
} from 'loan-servicing-common'
import EventEntity from 'models/entities/EventEntity'
import { Propagation, Transactional } from 'typeorm-transactional'
import EventService from './event.service'
import FacilityTransactionService from './facilityTransaction.service'

@Injectable()
class FacilityService {
  constructor(
    @Inject(EventService) private eventService: EventService,
    @InjectRepository(FacilityEntity)
    private facilityRepo: Repository<FacilityEntity>,
    @Inject(FacilityTransactionService)
    private transactionService: FacilityTransactionService,
  ) {}

  @Transactional()
  async createNewFacility(facility: NewFacilityRequestDto): Promise<Facility> {
    const savedEvent = await this.eventService.addEvent<CreateNewFacilityEvent>(
      {
        streamId: crypto.randomUUID(),
        effectiveDate: facility.issuedEffectiveDate,
        type: 'CreateNewFacility',
        typeVersion: 1,
        eventData: facility,
      },
    )
    const transactions = await this.transactionService.buildTransactions(
      savedEvent.streamId,
    )
    const latestTransaction = transactions[transactions.length - 1]

    const projection = await this.facilityRepo.create({
      ...savedEvent.eventData,
      facilityAmount: latestTransaction.balanceAfterTransaction,
      streamId: savedEvent.streamId,
      streamVersion: 1,
    })
    await this.facilityRepo.save(projection)

    return projection
  }

  @Transactional()
  async updateFacility(
    streamId: string,
    streamVersion: number,
    update: Partial<NewFacilityRequestDto>,
    eventEffectiveDate: Date,
  ): Promise<Facility> {
    const updateEvent = await this.eventService.addEvent<UpdateFacilityEvent>(
      {
        streamId,
        effectiveDate: eventEffectiveDate,
        type: 'UpdateFacility',
        typeVersion: 1,
        eventData: update,
      },
      streamVersion,
    )

    const transactions =
      await this.transactionService.buildTransactions(streamId)
    const latestTransaction = transactions[transactions.length - 1]

    const existingFacility = await this.getFacility(streamId)

    const updatedFacility = await this.facilityRepo.save({
      ...existingFacility,
      facilityAmount: latestTransaction.balanceAfterTransaction,
      ...update,
      streamVersion: updateEvent.streamVersion,
    })
    return updatedFacility
  }

  @Transactional()
  async adjustFacilityPrincipal(
    streamId: string,
    streamVersion: number,
    { effectiveDate, adjustment }: AdjustFacilityPrincipalDto,
  ): Promise<Facility> {
    // Add event
    const updateEvent =
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

    const transactions =
      await this.transactionService.buildTransactions(streamId)

    const latestTransaction = transactions[transactions.length - 1]

    const facilityEntity = await this.getFacility(streamId)
    facilityEntity.streamVersion = updateEvent.streamVersion
    facilityEntity.facilityAmount = latestTransaction.balanceAfterTransaction

    return this.facilityRepo.save(facilityEntity)
  }

  @Transactional({ propagation: Propagation.SUPPORTS })
  async getFacilityEvents(
    streamId: string,
  ): Promise<EventEntity<LoanServicingEvent>[]> {
    const events = await this.eventService.getEventsInOrder(streamId)
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

  getFacilityFromEvents(events: EventEntity<LoanServicingEvent>[]): Facility {
    const create = events[0] as CreateNewFacilityEvent
    const updates = events.slice(1)
    const result: Facility = updates.reduce(
      (facility, update) => {
        if (update.type === 'UpdateFacility') {
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
