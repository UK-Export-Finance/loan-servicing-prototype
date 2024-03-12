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
  Transaction,
  TransactionResolution,
  SummarisedTransaction,
} from 'loan-servicing-common'
import {
  AddWithdrawalToDrawingDtoClass,
  DrawingDtoClass,
  NewDrawingRequestDtoClass,
  RevertWithdrawalDtoClass,
  UpdateInterestRequestDtoClass,
} from 'models/dtos/drawing'
import { UntypedEventClass } from 'models/dtos/event'
import TransactionEntity from 'models/entities/TransactionEntity'
import DrawingService from './drawing.service'
import DrawingTransactionService from './drawing.service.transactions'

@ApiTags('Drawing')
@Controller('/facility/:facilityId/drawing')
@ApiParam({ name: 'facilityId', required: true, type: 'string' })
class DrawingController {
  constructor(
    private drawingService: DrawingService,
    private transactionService: DrawingTransactionService,
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
  @ApiOkResponse({ type: UntypedEventClass })
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
  @ApiOkResponse({ type: TransactionEntity })
  async getDrawingTransactions(
    @Param('facilityId') facilityId: string,
    @Param('drawingId') drawingStreamId: string,
    @Query('interestResolution')
    interestResolution: TransactionResolution = 'daily',
  ): Promise<Transaction[] | SummarisedTransaction[]> {
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
    @Query('facilityVersion') facilityVersion: number,
  ): Promise<DrawingDtoClass> {
    const newDrawing = await this.drawingService.createNewDrawing(
      facilityId,
      facilityVersion,
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
    @Body() body: AddWithdrawalToDrawingDtoClass,
  ): Promise<DrawingDtoClass> {
    const updatedDrawing = await this.drawingService.withdrawFromDrawing(
      facilityId,
      drawingId,
      Number(version),
      body,
    )
    return updatedDrawing
  }

  @Post(':drawingId/withdrawal/revert')
  @ApiOkResponse({ type: DrawingDtoClass })
  async revertWithdrawal(
    @Param('facilityId') facilityId: string,
    @Param('drawingId') drawingId: string,
    @Body() body: RevertWithdrawalDtoClass,
    @Query('version') version: number,
  ): Promise<DrawingDtoClass> {
    const updatedDrawing = await this.drawingService.revertWithdrawal(
      facilityId,
      drawingId,
      Number(version),
      body,
    )
    return updatedDrawing
  }
}

export default DrawingController
