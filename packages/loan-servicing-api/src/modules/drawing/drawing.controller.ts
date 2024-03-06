import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
} from '@nestjs/common'
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger'
import {
  LoanServicingEvent,
  DrawingTransaction,
  TransactionResolution,
  SummarisedTransaction,
} from 'loan-servicing-common'
import {
  DrawingDtoClass,
  NewDrawingRequestDtoClass,
  UpdateInterestRequestDtoClass,
} from 'models/dtos/drawing'
import { UntypedEvent } from 'models/dtos/event'
import { AddDrawingDtoClass } from 'models/dtos/facility'
import DrawingTransactionEntity from 'models/entities/FacilityTransactionEntity'
import DrawingService from './drawing.service'
import DrawingProjectionsService from './drawing.service.projections'

@ApiTags('Drawing')
@Controller('/facility/:facilityId/drawing')
@ApiParam({ name: 'facilityId', required: true, type: 'string' })
class DrawingController {
  constructor(
    private drawingService: DrawingService,
    private transactionService: DrawingProjectionsService,
  ) {}

  @Get(':drawingId')
  @ApiOkResponse({ type: DrawingDtoClass })
  async getDrawing(
    @Param('drawingId') drawingStreamId: string,
  ): Promise<DrawingDtoClass> {
    const facility = await this.drawingService.getDrawing(drawingStreamId)
    if (facility === null) {
      throw new NotFoundException()
    }
    return facility
  }

  @Get(':drawingId/events')
  @ApiOkResponse({ type: UntypedEvent })
  async getDrawingEvents(
    @Param('drawingId') drawingStreamId: string,
  ): Promise<LoanServicingEvent[]> {
    const facilityEvents =
      await this.drawingService.getDrawingEvents(drawingStreamId)
    if (facilityEvents === null) {
      throw new NotFoundException()
    }
    return facilityEvents
  }

  @Get(':drawingId/transactions')
  @ApiOkResponse({ type: DrawingTransactionEntity })
  async getDrawingTransactions(
    @Param('facilityId') facilityId: string,
    @Param('drawingId') drawingStreamId: string,
    @Query('interestResolution')
    interestResolution: TransactionResolution = 'daily',
  ): Promise<DrawingTransaction[] | SummarisedTransaction[]> {
    await this.transactionService.buildProjections(facilityId, drawingStreamId)
    const facilityEvents =
      interestResolution === 'daily'
        ? await this.transactionService.getDailyTransactions(drawingStreamId)
        : await this.transactionService.getMonthlyTransactions(drawingStreamId)
    if (facilityEvents === null) {
      throw new NotFoundException()
    }
    return facilityEvents
  }

  @Get()
  @ApiOkResponse({ type: DrawingDtoClass })
  async getAllDrawing(): Promise<DrawingDtoClass[] | null> {
    const allEvents = await this.drawingService.getAllDrawings()
    if (allEvents === null) {
      throw new NotFoundException()
    }
    return allEvents
  }

  @Post('')
  @ApiCreatedResponse({ type: DrawingDtoClass })
  async newDrawing(
    @Body() body: NewDrawingRequestDtoClass,
    @Param('facilityId') facilityId: string,
  ): Promise<DrawingDtoClass> {
    const newDrawing = await this.drawingService.createNewDrawing(
      facilityId,
      body,
    )
    return newDrawing
  }

  @Post(':drawingId/updateInterestRate')
  @ApiOkResponse({ type: DrawingDtoClass })
  async updateDrawingInterestRate(
    @Param('facilityId') facilityId: string,
    @Param('drawingId') drawingId: string,
    @Query('version') version: number,
    @Body() body: UpdateInterestRequestDtoClass,
  ): Promise<DrawingDtoClass> {
    const updatedDrawing = await this.drawingService.updateInterestRate(
      facilityId,
      drawingId,
      Number(version),
      body,
    )
    return updatedDrawing
  }

  @Post(':drawingId/withdrawal')
  @ApiOkResponse({ type: DrawingDtoClass })
  async withdrawFromDrawing(
    @Param('facilityId') facilityId: string,
    @Param('drawingId') drawingId: string,
    @Query('version') version: number,
    @Body() body: AddDrawingDtoClass,
  ): Promise<DrawingDtoClass> {
    const updatedDrawing = await this.drawingService.withdrawFromDrawing(
      facilityId,
      drawingId,
      Number(version),
      body,
    )
    return updatedDrawing
  }

  @Post(':drawingId/withdrawal/:withdrawalId/revert')
  @ApiOkResponse({ type: DrawingDtoClass })
  async revertWithdrawal(
    @Param('facilityId') facilityId: string,
    @Param('drawingId') drawingId: string,
    @Param('withdrawalId') withdrawalId: string,
    @Query('version') version: number,
  ): Promise<DrawingDtoClass> {
    const updatedDrawing = await this.drawingService.revertWithdrawal(
      facilityId,
      drawingId,
      withdrawalId,
      Number(version),
    )
    return updatedDrawing
  }
}

export default DrawingController
