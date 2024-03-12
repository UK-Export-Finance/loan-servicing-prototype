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
  FacilityType,
} from 'loan-servicing-common'
import {
  CreateDrawingNjkInput,
  NewDrawingRequestFormDto,
} from 'templates/create-drawing'
import mapCreateDrawingFormToRequest from 'mappers/form-mappers/createDrawingMapper'
import { CreateDrawingStrategySelectNjkInput } from 'templates/create-drawing-start'
import {
  filterSelectOptions,
  calculateInterestSelectOptions,
  repaymentsSelectOptions,
} from 'controls/strategyControlsOptions'
import mapEventsToTable from 'mappers/nunjuck-mappers/eventTable'
import mapTransactionsToTable from 'mappers/nunjuck-mappers/transactionTable'
import mapTransactionsToWithdrawalsSummary from 'mappers/nunjuck-mappers/transactionsToWithdrawals'
import DrawingService from './drawing.service'

@Controller('facility/:facilityId/drawing')
class DrawingController {
  constructor(private drawingService: DrawingService) {}

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
    const transactions = await this.drawingService.getDrawingTransactionRows(
      facilityId,
      drawingId,
    )

    return {
      drawing,
      eventRows: mapEventsToTable(events!),
      drawingCreated,
      transactionRows: mapTransactionsToTable(transactions!),
      drawingSummaryListProps: drawingToDrawingSummary(drawing),
      withdrawalsSummaryProps: mapTransactionsToWithdrawalsSummary(
        facilityId,
        drawingId,
        transactions!,
      ),
    }
  }

  @Get('new/start')
  @Render('create-drawing-start')
  async renderFacilityStrategySelectionPage(
    @Param('facilityId') facilityId: string,
    @Query('facilityType') facilityTypeName: string,
  ): Promise<CreateDrawingStrategySelectNjkInput> {
    const facilityType = await tryGetApiData<FacilityType>(
      `facility-type/${facilityTypeName}`,
    )
    if (!facilityType) {
      throw new Error('No facility type found')
    }
    return {
      calculateInterestStrategyNames: filterSelectOptions(
        calculateInterestSelectOptions,
        facilityType.interestStrategies,
      ),
      repaymentStrategyNames: filterSelectOptions(
        repaymentsSelectOptions,
        facilityType.repaymentsStrategies,
      ),
      facilityId,
    }
  }

  @Get('')
  @Render('create-drawing')
  async renderCreateFacilityPage(
    @Param('facilityId') facilityId: string,
    @Query('repaymentStrategy')
    repaymentStrategy: RepaymentStrategyName,
    @Query('calculateInterestStrategy')
    calculateInterestStrategy: CalculateInterestStrategyName,
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
    @Query('facilityVersion') facilityVersion: number,
    @Res() response: Response,
  ): Promise<void> {
    const newDrawingRequest: NewDrawingRequestDto =
      mapCreateDrawingFormToRequest(requestDto)
    const drawing = await this.drawingService.createDrawing(
      facilityId,
      facilityVersion,
      newDrawingRequest,
    )
    response.redirect(
      `/facility/${facilityId}/drawing/${drawing?.streamId}?facilityCreated=true`,
    )
  }
}

export default DrawingController
