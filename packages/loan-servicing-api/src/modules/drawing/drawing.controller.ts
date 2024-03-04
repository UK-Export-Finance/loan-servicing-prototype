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
  ApiTags,
} from '@nestjs/swagger'
import {
  LoanServicingEvent,
  DrawingTransaction,
  TransactionResolution,
} from 'loan-servicing-common'
import { DrawingDtoClass, NewDrawingRequestDtoClass, UpdateInterestRequestDtoClass } from 'models/dtos/drawing'
import { UntypedEvent } from 'models/dtos/event'
import {
  AddDrawingDtoClass,
} from 'models/dtos/facility'
import DrawingTransactionEntity from 'models/entities/FacilityTransactionEntity'
import DrawingService from './drawing.service'
import DrawingProjectionsService from './drawing.service.projections'

@ApiTags('Drawing')
@Controller('/facility/:facilityId/drawing')
class DrawingController {
  constructor(
    private drawingService: DrawingService,
    private transactionService: DrawingProjectionsService,
  ) {}

  @Get(':id')
  @ApiOkResponse({ type: DrawingDtoClass })
  async getDrawing(
    @Param('id') streamId: string,
  ): Promise<DrawingDtoClass> {
    const facility = await this.drawingService.getDrawing(streamId)
    if (facility === null) {
      throw new NotFoundException()
    }
    return facility
  }

  @Get(':id/events')
  @ApiOkResponse({ type: UntypedEvent })
  async getDrawingEvents(
    @Param('id') streamId: string,
  ): Promise<LoanServicingEvent[]> {
    const facilityEvents =
      await this.drawingService.getDrawingEvents(streamId)
    if (facilityEvents === null) {
      throw new NotFoundException()
    }
    return facilityEvents
  }

  @Get(':id/transactions')
  @ApiOkResponse({ type: DrawingTransactionEntity })
  async getDrawingTransactions(
    @Param('id') streamId: string,
    @Query('interestResolution')
    interestResolution: TransactionResolution = 'daily',
  ): Promise<DrawingTransaction[]> {
   await this.transactionService.buildProjections(streamId)
    const facilityEvents =
      interestResolution === 'daily'
        ? await this.transactionService.getDailyTransactions(streamId)
        : await this.transactionService.getMonthlyTransactions(streamId)
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

  @Post('new')
  @ApiCreatedResponse({ type: DrawingDtoClass })
  async newDrawing(
    @Body() body: NewDrawingRequestDtoClass,
  ): Promise<DrawingDtoClass> {
    const newDrawing = await this.drawingService.createNewDrawing(body)
    return newDrawing
  }

  @Post(':id/updateInterestRate')
  @ApiOkResponse({ type: DrawingDtoClass })
  async updateDrawingInterestRate(
    @Param('id') id: string,
    @Query('version') version: number,
    @Body() body: UpdateInterestRequestDtoClass,
  ): Promise<DrawingDtoClass> {
    const updatedDrawing = await this.drawingService.updateInterestRate(
      id,
      Number(version),
      body,
    )
    return updatedDrawing
  }

  @Post(':id/withdrawal')
  @ApiOkResponse({ type: DrawingDtoClass })
  async withdrawFromDrawing(
    @Param('id') id: string,
    @Query('version') version: number,
    @Body() body: AddDrawingDtoClass,
  ): Promise<DrawingDtoClass> {
    const updatedDrawing = await this.drawingService.addDrawing(
      id,
      Number(version),
      body,
    )
    return updatedDrawing
  }
}

export default DrawingController
