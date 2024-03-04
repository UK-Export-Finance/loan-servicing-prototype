import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import DrawingEntity from 'models/entities/DrawingEntity'
import { Repository } from 'typeorm'
import {
  LoanServicingEvent,
  Drawing,
  NewDrawingRequestDto,
  UpdateInterestEvent,
  UpdateDrawingInterestRequestDto,
  AddWithdrawalToDrawingDto,
  AddDrawingEvent,
  CreateNewDrawingEvent,
} from 'loan-servicing-common'
import { Propagation, Transactional } from 'typeorm-transactional'
import EventService from 'modules/event/event.service'
import DrawingProjectionsService from './drawing.service.projections'

@Injectable()
class DrawingService {
  constructor(
    @Inject(EventService) private eventService: EventService,
    @InjectRepository(DrawingEntity)
    private facilityRepo: Repository<DrawingEntity>,
    @Inject(DrawingProjectionsService)
    private projectionsService: DrawingProjectionsService,
  ) {}

  @Transactional()
  async createNewDrawing(
    facilityRequest: NewDrawingRequestDto,
  ): Promise<Drawing> {
    const savedEvent = await this.eventService.addEvent<CreateNewDrawingEvent>({
      streamId: crypto.randomUUID(),
      effectiveDate: facilityRequest.issuedEffectiveDate,
      type: 'CreateNewDrawing',
      typeVersion: 1,
      eventData: facilityRequest,
    })
    const { drawing } = await this.projectionsService.buildProjections(
      savedEvent.streamId,
    )
    return drawing
  }

  @Transactional()
  async updateInterestRate(
    streamId: string,
    streamVersion: number,
    update: UpdateDrawingInterestRequestDto,
  ): Promise<Drawing> {
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

    const { drawing: facility } =
      await this.projectionsService.buildProjections(streamId)
    return facility
  }

  @Transactional()
  async addDrawing(
    streamId: string,
    streamVersion: number,
    update: AddWithdrawalToDrawingDto,
  ): Promise<Drawing> {
    await this.eventService.addEvent<AddDrawingEvent>(
      {
        streamId,
        effectiveDate: update.date,
        type: 'AddDrawing',
        typeVersion: 1,
        eventData: update,
      },
      streamVersion,
    )

    const { drawing: facility } =
      await this.projectionsService.buildProjections(streamId)
    return facility
  }

  @Transactional({ propagation: Propagation.SUPPORTS })
  async getDrawingEvents(streamId: string): Promise<LoanServicingEvent[]> {
    const events = await this.eventService.getEventsInCreationOrder(streamId)
    return events
  }

  @Transactional({ propagation: Propagation.SUPPORTS })
  async getDrawing(streamId: string): Promise<Drawing> {
    const facility = await this.facilityRepo.findOne({ where: { streamId } })
    if (!facility) {
      throw new NotFoundException(`No facility found for id ${streamId}`)
    }
    return facility
  }

  async getAllDrawings(): Promise<Drawing[] | null> {
    return this.facilityRepo.find()
  }
}

export default DrawingService
