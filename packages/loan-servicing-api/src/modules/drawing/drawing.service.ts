import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import DrawingEntity from 'models/entities/DrawingEntity'
import { Repository } from 'typeorm'
import {
  LoanServicingEvent,
  Drawing,
  NewDrawingRequestDto,
  AddWithdrawalToDrawingDto,
  WithdrawFromDrawingEvent,
  RevertWithdrawalEvent,
  RevertWithdrawlDto,
  AddDrawingToFacilityEvent,
  CreateNewDrawingEvent,
  SetDrawingRepaymentsEvent,
  sortByDateOnKey,
  AddFixedDrawingAccrualDto,
  AddMarketDrawingAccrualDto,
  AddDrawingAccrualEvent,
  DrawingAccrualStrategyName,
} from 'loan-servicing-common'
import { Propagation, Transactional } from 'typeorm-transactional'
import EventService from 'modules/event/event.service'
import ProjectionsService from 'modules/projections/projections.service'
import {
  ManualRepaymentStrategyOptionsDtoClass,
  RegularRepaymentStrategyOptionsDtoClass,
} from 'models/dtos/drawingConfiguration'

@Injectable()
class DrawingService {
  constructor(
    @Inject(EventService) private eventService: EventService,
    @InjectRepository(DrawingEntity)
    private drawingRepo: Repository<DrawingEntity>,
    @Inject(ProjectionsService)
    private projectionsService: ProjectionsService,
  ) {}

  @Transactional()
  async createNewDrawing(
    facilityId: string,
    facilityVersion: number,
    drawingRequest: NewDrawingRequestDto,
    projectionDate?: Date,
  ): Promise<Drawing> {
    const savedEvent =
      await this.eventService.addEvent<AddDrawingToFacilityEvent>(
        {
          streamId: facilityId,
          effectiveDate: drawingRequest.issuedEffectiveDate,
          entityType: 'facility',
          shouldProcessIfFuture: false,
          type: 'AddDrawingToFacility',
          typeVersion: 1,
          eventData: { ...drawingRequest, streamId: crypto.randomUUID() },
        },
        facilityVersion,
      )
    const drawingId = savedEvent.eventData.streamId

    await this.eventService.addEvent<CreateNewDrawingEvent>({
      streamId: drawingId,
      effectiveDate: drawingRequest.issuedEffectiveDate,
      entityType: 'drawing',
      type: 'CreateNewDrawing',
      shouldProcessIfFuture: false,
      typeVersion: 1,
      eventData: { ...drawingRequest },
    })
    let streamVersion = 1
    if (drawingRequest.drawingConfig.repaymentsStrategy) {
      const repaymentResult = await this.setRepayments(
        facilityId,
        drawingId,
        streamVersion,
        drawingRequest.drawingConfig.repaymentsStrategy,
      )
      streamVersion = repaymentResult.streamVersion
    }

    await this.eventService.addEvent<WithdrawFromDrawingEvent>(
      {
        streamId: drawingId,
        effectiveDate: drawingRequest.issuedEffectiveDate,
        entityType: 'drawing',
        type: 'WithdrawFromDrawing',
        shouldProcessIfFuture: false,
        typeVersion: 1,
        eventData: {
          date: drawingRequest.issuedEffectiveDate,
          amount: drawingRequest.outstandingPrincipal,
        },
      },
      streamVersion,
    )

    const { drawing } =
      await this.projectionsService.buildProjectionsForDrawingOnDate(
        facilityId,
        savedEvent.eventData.streamId,
        projectionDate,
      )

    return drawing
  }

  @Transactional()
  async withdrawFromDrawing(
    facilityId: string,
    drawingId: string,
    streamVersion: number,
    update: AddWithdrawalToDrawingDto,
    projectionDate?: Date,
  ): Promise<Drawing> {
    await this.eventService.addEvent<WithdrawFromDrawingEvent>(
      {
        streamId: drawingId,
        effectiveDate: update.date,
        entityType: 'drawing',
        type: 'WithdrawFromDrawing',
        shouldProcessIfFuture: false,
        typeVersion: 1,
        eventData: update,
      },
      streamVersion,
    )

    const { drawing: facility } =
      await this.projectionsService.buildProjectionsForDrawingOnDate(
        facilityId,
        drawingId,
        projectionDate,
      )
    return facility
  }

  @Transactional()
  async revertWithdrawal(
    facilityId: string,
    drawingId: string,
    streamVersion: number,
    eventData: RevertWithdrawlDto,
    projectionDate?: Date,
  ): Promise<Drawing> {
    await this.eventService.addEvent<RevertWithdrawalEvent>(
      {
        streamId: drawingId,
        effectiveDate: eventData.dateOfWithdrawal,
        entityType: 'drawing',
        type: 'RevertWithdrawal',
        shouldProcessIfFuture: false,
        typeVersion: 1,
        eventData,
      },
      streamVersion,
    )

    const { drawing } =
      await this.projectionsService.buildProjectionsForDrawingOnDate(
        facilityId,
        drawingId,
        projectionDate,
      )
    return drawing
  }

  @Transactional()
  async setRepayments(
    facilityId: string,
    drawingId: string,
    streamVersion: number,
    eventData:
      | RegularRepaymentStrategyOptionsDtoClass
      | ManualRepaymentStrategyOptionsDtoClass,
    projectionDate?: Date,
  ): Promise<Drawing> {
    await this.eventService.softDeleteEventsWhere({
      streamId: drawingId,
      type: 'SetDrawingRepayments',
    })
    await this.eventService.addEvent<SetDrawingRepaymentsEvent>(
      {
        streamId: drawingId,
        effectiveDate:
          eventData.name === 'Manual'
            ? eventData.repayments.sort(sortByDateOnKey('date'))[0].date
            : eventData.startDate,
        entityType: 'drawing',
        shouldProcessIfFuture: true,
        type: 'SetDrawingRepayments',
        typeVersion: 1,
        eventData,
      },
      streamVersion,
    )

    const { drawing } =
      await this.projectionsService.buildProjectionsForDrawingOnDate(
        facilityId,
        drawingId,
        projectionDate,
      )
    return drawing
  }

  @Transactional()
  async addDrawingAccrual(
    facilityId: string,
    streamId: string,
    streamVersion: number,
    feeConfig: (AddFixedDrawingAccrualDto | AddMarketDrawingAccrualDto) & {
      name: DrawingAccrualStrategyName
    },
    projectionDate?: Date,
  ): Promise<Drawing> {
    await this.eventService.addEvent<AddDrawingAccrualEvent>(
      {
        streamId,
        effectiveDate: feeConfig.effectiveDate,
        entityType: 'drawing',
        type: 'AddDrawingAccrual',
        typeVersion: 1,
        shouldProcessIfFuture: true,
        eventData: {
          ...feeConfig,
          accrualId: crypto.randomUUID(),
        },
      },
      streamVersion,
    )
    const { drawing } =
      await this.projectionsService.buildProjectionsForDrawingOnDate(
        facilityId,
        streamId,
        projectionDate,
      )
    return drawing
  }

  @Transactional({ propagation: Propagation.SUPPORTS })
  async getDrawingEvents(streamId: string): Promise<LoanServicingEvent[]> {
    const events =
      await this.eventService.getActiveEventsInCreationOrder(streamId)
    return events
  }

  @Transactional({ propagation: Propagation.SUPPORTS })
  async getDrawing(streamId: string, projectionDate?: Date | undefined): Promise<Drawing> {
    const drawing = await this.drawingRepo.findOne({
      where: { streamId },
      relations: { facility: true },
    })
    if (!drawing) {
      throw new NotFoundException(`No facility found for id ${streamId}`)
    }
    await this.projectionsService.buildProjectionsForDrawingOnDate(
      drawing.facility.streamId,
      streamId,
      projectionDate,
    )
    return drawing
  }

  async getAllDrawings(): Promise<Drawing[] | null> {
    return this.drawingRepo.find()
  }
}

export default DrawingService
