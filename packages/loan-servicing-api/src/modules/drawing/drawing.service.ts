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
  RecordDrawingRepaymentEvent,
  RecordDrawingAccrualPaymentDto,
  RecordDrawingAccrualPaymentEvent,
} from 'loan-servicing-common'
import { Propagation, Transactional } from 'typeorm-transactional'
import EventService from 'modules/event/event.service'
import ProjectionsService from 'modules/projections/projections.service'
import {
  ManualRepaymentStrategyOptionsDtoClass,
  RegularRepaymentStrategyOptionsDtoClass,
} from 'models/dtos/drawingConfiguration'
import { RecordDrawingRepaymentDtoClass } from 'models/dtos/drawingRepayment'
import SystemValueService from 'modules/systemValue/systemValue.service'

@Injectable()
class DrawingService {
  constructor(
    @Inject(EventService) private eventService: EventService,
    @InjectRepository(DrawingEntity)
    private drawingRepo: Repository<DrawingEntity>,
    @Inject(ProjectionsService)
    private projectionsService: ProjectionsService,
    @Inject(SystemValueService) private systemValueService: SystemValueService,
  ) {}

  @Transactional()
  async createNewDrawing(
    facilityId: string,
    facilityVersion: number,
    drawingRequest: NewDrawingRequestDto,
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
          isApproved: true,
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
      isApproved: true,
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
        isApproved: true,
      },
      streamVersion,
    )

    const { drawing } =
      await this.projectionsService.buildProjectionsForDrawingOnDate(
        facilityId,
        savedEvent.eventData.streamId,
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
        shouldProcessIfFuture: false,
        typeVersion: 1,
        eventData: update,
        isApproved: true,
      },
      streamVersion,
    )

    const { drawing: facility } =
      await this.projectionsService.buildProjectionsForDrawingOnDate(
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
        shouldProcessIfFuture: false,
        typeVersion: 1,
        eventData,
        isApproved: true,
      },
      streamVersion,
    )

    const { drawing } =
      await this.projectionsService.buildProjectionsForDrawingOnDate(
        facilityId,
        drawingId,
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
        isApproved: true,
      },
      streamVersion,
    )

    const { drawing } =
      await this.projectionsService.buildProjectionsForDrawingOnDate(
        facilityId,
        drawingId,
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
        isApproved: true,
      },
      streamVersion,
    )
    const { drawing } =
      await this.projectionsService.buildProjectionsForDrawingOnDate(
        facilityId,
        streamId,
      )
    return drawing
  }

  @Transactional()
  async setRepaymentAsReceived(
    facilityId: string,
    drawingId: string,
    streamVersion: number,
    repaymentDto: RecordDrawingRepaymentDtoClass,
  ): Promise<Drawing> {
    await this.eventService.addEvent<RecordDrawingRepaymentEvent>(
      {
        streamId: drawingId,
        effectiveDate: repaymentDto.date,
        entityType: 'drawing',
        shouldProcessIfFuture: false,
        type: 'RecordDrawingRepayment',
        typeVersion: 1,
        eventData: {
          repaymentId: repaymentDto.repaymentId,
          amount: repaymentDto.amount,
        },
        isApproved: false,
      },
      streamVersion,
    )
    const { drawing } =
      await this.projectionsService.buildProjectionsForDrawingOnDate(
        facilityId,
        drawingId,
      )
    return drawing
  }

  @Transactional()
  async receiveAccrualPayment(
    facilityId: string,
    drawingId: string,
    streamVersion: number,
    repaymentDto: RecordDrawingAccrualPaymentDto,
  ): Promise<Drawing> {
    await this.eventService.addEvent<RecordDrawingAccrualPaymentEvent>(
      {
        streamId: drawingId,
        effectiveDate: repaymentDto.date,
        entityType: 'drawing',
        shouldProcessIfFuture: false,
        type: 'RecordDrawingAccrualPayment',
        typeVersion: 1,
        eventData: {
          accrualId: repaymentDto.accrualId,
          amount: repaymentDto.amount,
        },
        isApproved: false,
      },
      streamVersion,
    )
    const { drawing } =
      await this.projectionsService.buildProjectionsForDrawingOnDate(
        facilityId,
        drawingId,
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
  async getDrawing(streamId: string, rebuild?: boolean): Promise<Drawing> {
    const drawing = await this.drawingRepo.findOne({
      where: { streamId },
      relations: { facility: true },
    })
    if (!drawing) {
      throw new NotFoundException(`No facility found for id ${streamId}`)
    }
    if (rebuild) {
      await this.projectionsService.buildProjectionsForDrawingOnDate(
        drawing.facility.streamId,
        streamId,
      )
    }
    const rebuiltDrawing = await this.drawingRepo.findOne({
      where: { streamId },
      relations: { facility: true },
    })
    return rebuiltDrawing!
  }

  async getAllDrawings(): Promise<Drawing[] | null> {
    return this.drawingRepo.find()
  }
}

export default DrawingService
