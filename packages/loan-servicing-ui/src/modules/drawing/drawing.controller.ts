import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  Render,
  Res,
} from '@nestjs/common'
import { Response } from 'express'
import { drawingToDrawingSummary } from 'mappers/nunjuck-mappers/drawingSummary'
import { DrawingNjkInput } from 'templates/drawing'
import { tryGetApiData } from 'api/base-client'
import {
  RepaymentStrategyName,
  CalculateInterestStrategyName,
  Facility,
  NewDrawingRequestDto,
} from 'loan-servicing-common'
import {
  CreateDrawingNjkInput,
  NewDrawingRequestFormDto,
} from 'templates/create-drawing'
import mapCreateDrawingFormToRequest from 'mappers/form-mappers/createDrawingMapper'
import DrawingService from './drawing.service'

@Controller('facility/:facilityId/drawing')
class DrawingController {
  constructor(
    private drawingService: DrawingService,
  ) {}

  @Get(':drawingId')
  @Render('drawing')
  async renderDrawingPage(
    @Param('facilityId') facilityId: string,
    @Param('drawingId') drawingId: string,
    @Query('drawingCreated') drawingCreated?: boolean,
  ): Promise<DrawingNjkInput> {
    const drawing = await this.drawingService.getDrawing(facilityId, drawingId)
    if (!drawing) {
      throw new NotFoundException()
    }
    const events = await this.drawingService.getDrawingEventTableRows(
      facilityId,
      drawingId,
    )
    const transactionRows = await this.drawingService.getDrawingTransactionRows(
      facilityId,
      drawingId,
    )

    return {
      drawing,
      eventRows: events!,
      drawingCreated,
      transactionRows: transactionRows!,
      drawingSummaryListProps: drawingToDrawingSummary(drawing),
    }
  }

  @Get('')
  @Render('create-drawing')
  async renderCreateFacilityPage(
    @Param('facilityId') facilityId: string,
    @Query('repaymentStrategy')
    repaymentStrategy: RepaymentStrategyName = 'Regular',
    @Query('calculateInterestStrategy')
    calculateInterestStrategy: CalculateInterestStrategyName = 'Compounding',
  ): Promise<CreateDrawingNjkInput> {
    const facility = await tryGetApiData<Facility>(`facility/${facilityId}`)
    if (!facility) {
      throw new Error('No facility found')
    }
    return {
      calculateInterestStrategy,
      repaymentStrategy,
      facility,
    }
  }

  @Post('')
  async createDrawing(
    @Param('facilityId') facilityId: string,
    @Body() requestDto: NewDrawingRequestFormDto,
    @Res() response: Response,
  ): Promise<void> {
    const newDrawingRequest: NewDrawingRequestDto =
      mapCreateDrawingFormToRequest(requestDto)
    const drawing = await this.drawingService.createDrawing(
      facilityId,
      newDrawingRequest,
    )
    response.redirect(
      `/facility/${facilityId}/drawing/${drawing?.streamId}?facilityCreated=true`,
    )
  }
}

export default DrawingController
