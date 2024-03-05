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
  CreateNewDrawingEvent,
  WithdrawFromDrawingEvent,
} from 'loan-servicing-common'
import { Propagation, Transactional } from 'typeorm-transactional'
import EventService from 'modules/event/event.service'
import FacilityEntity from 'models/entities/FacilityEntity'
import DrawingProjectionsService from './drawing.service.projections'

@Injectable()
class DrawingService {
  constructor(
    @Inject(EventService) private eventService: EventService,
    @InjectRepository(DrawingEntity)
    private drawingRepo: Repository<DrawingEntity>,
    @InjectRepository(FacilityEntity)
    private facilityRepo: Repository<FacilityEntity>,
    @Inject(DrawingProjectionsService)
    private projectionsService: DrawingProjectionsService,
  ) {}

  @Transactional()
  async createNewDrawing(
    facilityId: string,
    facilityRequest: NewDrawingRequestDto,
  ): Promise<Drawing> {
    const facility = await this.facilityRepo.findOneOrFail({
      where: { streamId: facilityId },
    })

    const savedEvent = await this.eventService.addEvent<CreateNewDrawingEvent>({
      streamId: crypto.randomUUID(),
      effectiveDate: facilityRequest.issuedEffectiveDate,
      type: 'CreateNewDrawing',
      typeVersion: 1,
      eventData: facilityRequest,
    })
    const { drawing } = await this.projectionsService.buildProjections(
      facilityId,
      savedEvent.streamId,
    )
    drawing.facility = facility
    await this.drawingRepo.save(drawing)
    return drawing
  }

  @Transactional()
  async updateInterestRate(
    facilityId: string,
    drawingId: string,
    drawingVersion: number,
    update: UpdateDrawingInterestRequestDto,
  ): Promise<Drawing> {
    await this.eventService.addEvent<UpdateInterestEvent>(
      {
        streamId: drawingId,
        effectiveDate: new Date(update.effectiveDate),
        type: 'UpdateInterest',
        typeVersion: 1,
        eventData: update,
      },
      drawingVersion,
    )

    const { drawing } =
      await this.projectionsService.buildProjections(facilityId, drawingId)
    return drawing
  }

  @Transactional()
  async withdrawFromDrawing(
    facilityId: string,
    drawingId: string,
    streamVersion: number,
    update: AddWithdrawalToDrawingDto,
  ): Promise<Drawing> {
    await this.eventService.addEvent<WithdrawFromDrawingEvent>(
      {
        streamId: drawingId,
        effectiveDate: update.date,
        type: 'WithdrawFromDrawing',
        typeVersion: 1,
        eventData: update,
      },
      streamVersion,
    )

    const { drawing: facility } =
      await this.projectionsService.buildProjections(facilityId, drawingId)
    return facility
  }

  @Transactional({ propagation: Propagation.SUPPORTS })
  async getDrawingEvents(streamId: string): Promise<LoanServicingEvent[]> {
    const events = await this.eventService.getEventsInCreationOrder(streamId)
    return events
  }

  @Transactional({ propagation: Propagation.SUPPORTS })
  async getDrawing(streamId: string): Promise<Drawing> {
    const facility = await this.drawingRepo.findOne({ where: { streamId } })
    if (!facility) {
      throw new NotFoundException(`No facility found for id ${streamId}`)
    }
    return facility
  }

  async getAllDrawings(): Promise<Drawing[] | null> {
    return this.drawingRepo.find()
  }
}

export default DrawingService
