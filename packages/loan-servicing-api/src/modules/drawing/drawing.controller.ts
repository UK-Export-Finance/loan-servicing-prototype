import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  SerializeOptions,
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
} from 'models/dtos/drawing'
import { UntypedEventClass } from 'models/dtos/event'
import TransactionEntity from 'models/entities/TransactionEntity'
import { plainToInstance } from 'class-transformer'
import {
  ManualRepaymentStrategyOptionsDtoClass,
  RegularRepaymentStrategyOptionsDtoClass,
} from 'models/dtos/drawingConfiguration'
import {
  AddFixedDrawingAccrualDtoClass,
  AddMarketDrawingAccrualDtoClass,
  RecordDrawingAccrualPaymentDtoClass,
} from 'models/dtos/drawingAccrual'
import { RecordDrawingRepaymentDtoClass } from 'models/dtos/drawingRepayment'
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
    @Query('rebuild') rebuild?: boolean,
  ): Promise<DrawingDtoClass> {
    const drawing = await this.drawingService.getDrawing(
      drawingStreamId,
      rebuild,
    )
    if (drawing === null) {
      throw new NotFoundException()
    }
    return plainToInstance(DrawingDtoClass, drawing, {
      enableCircularCheck: true,
    })
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
    return plainToInstance(DrawingDtoClass, allEvents, {
      enableCircularCheck: true,
    })
  }

  @Post('')
  @ApiCreatedResponse({ type: DrawingDtoClass })
  @SerializeOptions({ enableCircularCheck: true })
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
    return plainToInstance(DrawingDtoClass, newDrawing, {
      enableCircularCheck: true,
    })
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
    return plainToInstance(DrawingDtoClass, updatedDrawing, {
      enableCircularCheck: true,
    })
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
    return plainToInstance(DrawingDtoClass, updatedDrawing, {
      enableCircularCheck: true,
    })
  }

  @Post(':drawingId/repayments/regular')
  @ApiOkResponse({ type: DrawingDtoClass })
  async setRegularRepaymentsOnDrawing(
    @Param('facilityId') facilityId: string,
    @Param('drawingId') drawingId: string,
    @Query('version') version: number,
    @Body() body: RegularRepaymentStrategyOptionsDtoClass,
  ): Promise<DrawingDtoClass> {
    const updatedDrawing = await this.drawingService.setRepayments(
      facilityId,
      drawingId,
      Number(version),
      body,
    )
    return plainToInstance(DrawingDtoClass, updatedDrawing, {
      enableCircularCheck: true,
    })
  }

  @Post(':drawingId/repayments/manual')
  @ApiOkResponse({ type: DrawingDtoClass })
  async setManualRepaymentsOnDrawing(
    @Param('facilityId') facilityId: string,
    @Param('drawingId') drawingId: string,
    @Query('version') version: number,
    @Body() body: ManualRepaymentStrategyOptionsDtoClass,
  ): Promise<DrawingDtoClass> {
    const updatedDrawing = await this.drawingService.setRepayments(
      facilityId,
      drawingId,
      Number(version),
      body,
    )
    return plainToInstance(DrawingDtoClass, updatedDrawing, {
      enableCircularCheck: true,
    })
  }

  @Post(':drawingId/accrual/fixed')
  @ApiOkResponse({ type: DrawingDtoClass })
  async addFixedAccrualDrawing(
    @Param('facilityId') facilityId: string,
    @Param('drawingId') drawingId: string,
    @Query('version') version: number,
    @Body() body: AddFixedDrawingAccrualDtoClass,
  ): Promise<DrawingDtoClass> {
    const updatedDrawing = await this.drawingService.addDrawingAccrual(
      facilityId,
      drawingId,
      Number(version),
      { ...body, name: 'FixedDrawingAccrual' },
    )
    return plainToInstance(DrawingDtoClass, updatedDrawing, {
      enableCircularCheck: true,
    })
  }

  @Post(':drawingId/accrual/market')
  @ApiOkResponse({ type: DrawingDtoClass })
  async addMarketAccrualDrawing(
    @Param('facilityId') facilityId: string,
    @Param('drawingId') drawingId: string,
    @Query('version') version: number,
    @Body() body: AddMarketDrawingAccrualDtoClass,
  ): Promise<DrawingDtoClass> {
    const updatedDrawing = await this.drawingService.addDrawingAccrual(
      facilityId,
      drawingId,
      Number(version),
      { ...body, name: 'MarketDrawingAccrual' },
    )
    return plainToInstance(DrawingDtoClass, updatedDrawing, {
      enableCircularCheck: true,
    })
  }

  @Post(':drawingId/repaymentReceived')
  @ApiOkResponse({ type: DrawingDtoClass })
  async markRepaymentAsReceived(
    @Param('facilityId') facilityId: string,
    @Param('drawingId') drawingId: string,
    @Query('version') version: number,
    @Body() recordRepaymentDto: RecordDrawingRepaymentDtoClass,
  ): Promise<DrawingDtoClass> {
    const updatedDrawing = await this.drawingService.setRepaymentAsReceived(
      facilityId,
      drawingId,
      Number(version),
      recordRepaymentDto,
    )
    return plainToInstance(DrawingDtoClass, updatedDrawing, {
      enableCircularCheck: true,
    })
  }

  @Post(':drawingId/accuralPaymentReceived')
  @ApiOkResponse({ type: DrawingDtoClass })
  async processAccrualPayment(
    @Param('facilityId') facilityId: string,
    @Param('drawingId') drawingId: string,
    @Query('version') version: number,
    @Body() recordRepaymentDto: RecordDrawingAccrualPaymentDtoClass,
  ): Promise<DrawingDtoClass> {
    const updatedDrawing = await this.drawingService.receiveAccrualPayment(
      facilityId,
      drawingId,
      Number(version),
      recordRepaymentDto,
    )
    return plainToInstance(DrawingDtoClass, updatedDrawing, {
      enableCircularCheck: true,
    })
  }
}

export default DrawingController
