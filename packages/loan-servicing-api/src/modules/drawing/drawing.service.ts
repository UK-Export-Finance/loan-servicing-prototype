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
  WithdrawFromDrawingEvent,
  RevertWithdrawalEvent,
  RevertWithdrawlDto,
  AddDrawingToFacilityEvent,
  CreateNewDrawingEvent,
} from 'loan-servicing-common'
import { Propagation, Transactional } from 'typeorm-transactional'
import EventService from 'modules/event/event.service'
import FacilityEntity from 'models/entities/FacilityEntity'
import ProjectionsService from 'modules/projections/projections.service'

@Injectable()
class DrawingService {
  constructor(
    @Inject(EventService) private eventService: EventService,
    @InjectRepository(DrawingEntity)
    private drawingRepo: Repository<DrawingEntity>,
    @InjectRepository(FacilityEntity)
    private facilityRepo: Repository<FacilityEntity>,
    @Inject(ProjectionsService)
    private projectionsService: ProjectionsService,
  ) {}

  @Transactional()
  async createNewDrawing(
    facilityId: string,
    facilityVersion: number,
    drawingRequest: NewDrawingRequestDto,
  ): Promise<Drawing> {
    const facility = await this.facilityRepo.findOneOrFail({
      where: { streamId: facilityId },
    })

    const savedEvent =
      await this.eventService.addEvent<AddDrawingToFacilityEvent>(
        {
          streamId: facilityId,
          effectiveDate: drawingRequest.issuedEffectiveDate,
          entityType: 'facility',
          type: 'AddDrawingToFacility',
          typeVersion: 1,
          eventData: { ...drawingRequest, streamId: crypto.randomUUID() },
        },
        facilityVersion,
      )

    await this.eventService.addEvent<CreateNewDrawingEvent>({
      streamId: savedEvent.eventData.streamId,
      effectiveDate: drawingRequest.issuedEffectiveDate,
      entityType: 'drawing',
      type: 'CreateNewDrawing',
      typeVersion: 1,
      eventData: { ...drawingRequest },
    })
    const { drawing } =
      await this.projectionsService.buildProjectionsForDrawing(
        facilityId,
        savedEvent.eventData.streamId,
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
        entityType: 'drawing',
        type: 'UpdateInterest',
        typeVersion: 1,
        eventData: update,
      },
      drawingVersion,
    )

    const { drawing } =
      await this.projectionsService.buildProjectionsForDrawing(
        facilityId,
        drawingId,
      )
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
        entityType: 'drawing',
        type: 'WithdrawFromDrawing',
        typeVersion: 1,
        eventData: update,
      },
      streamVersion,
    )

    const { drawing: facility } =
      await this.projectionsService.buildProjectionsForDrawing(
        facilityId,
        drawingId,
      )
    return facility
  }

  @Transactional()
  async revertWithdrawal(
    facilityId: string,
    drawingId: string,
    streamVersion: number,
    eventData: RevertWithdrawlDto,
  ): Promise<Drawing> {
    await this.eventService.addEvent<RevertWithdrawalEvent>(
      {
        streamId: drawingId,
        effectiveDate: eventData.dateOfWithdrawal,
        entityType: 'drawing',
        type: 'RevertWithdrawal',
        typeVersion: 1,
        eventData,
      },
      streamVersion,
    )

    const { drawing } =
      await this.projectionsService.buildProjectionsForDrawing(
        facilityId,
        drawingId,
      )
    return drawing
  }

  @Transactional({ propagation: Propagation.SUPPORTS })
  async getDrawingEvents(streamId: string): Promise<LoanServicingEvent[]> {
    const events = await this.eventService.getEventsInCreationOrder(streamId)
    return events
  }

  @Transactional({ propagation: Propagation.SUPPORTS })
  async getDrawing(streamId: string): Promise<Drawing> {
    const drawing = await this.drawingRepo.findOne({
      where: { streamId },
      relations: { facility: true },
    })
    if (!drawing) {
      throw new NotFoundException(`No facility found for id ${streamId}`)
    }
    await this.projectionsService.buildProjectionsForDrawing(
      drawing.facility.streamId,
      streamId,
    )
    return drawing
  }

  async getAllDrawings(): Promise<Drawing[] | null> {
    return this.drawingRepo.find()
  }
}

export default DrawingService
