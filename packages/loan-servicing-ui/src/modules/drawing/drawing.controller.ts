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
import {
  accrualsToTable,
  drawingToDrawingSummary,
  drawingToRepaymentsSummary,
} from 'mappers/nunjuck-mappers/drawingSummary'
import { DrawingNjkInput } from 'templates/drawing'
import { tryGetApiData } from 'api/base-client'
import {
  RepaymentStrategyName,
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
  buildSelectOptionsFromStrings,
  filterSelectOptions,
  repaymentsSelectOptions,
} from 'controls/strategyControlsOptions'
import mapEventsToTable, {
  mapApprovalEventsToTable,
} from 'mappers/nunjuck-mappers/eventTable'
import mapTransactionsToTable from 'mappers/nunjuck-mappers/transactionTable'
import mapTransactionsToWithdrawalsSummary from 'mappers/nunjuck-mappers/transactionsToWithdrawals'
import { drawingAccrualStrategyNames } from 'strings/strategyNames'
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

    const approvalEvents = await this.drawingService.getDrawingApprovalEvents(
      facilityId,
      drawingId,
    )

    if (!approvalEvents) {
      throw new NotFoundException()
    }

    return {
      drawing,
      eventRows: mapEventsToTable(events!),
      drawingCreated,
      transactionRows: mapTransactionsToTable(transactions!),
      drawingSummaryListProps: drawingToDrawingSummary(drawing),
      accrualRows: accrualsToTable(drawing),
      repaymentsSummaryListProps: drawingToRepaymentsSummary(
        facilityId,
        drawing,
      ),
      approvalEvents: mapApprovalEventsToTable(
        facilityId,
        drawingId,
        approvalEvents,
      ),
      withdrawalsSummaryProps: mapTransactionsToWithdrawalsSummary(
        facilityId,
        drawingId,
        transactions!,
      ),
      currentDate: new Date(drawing.currentDate).toISOString().split('T')[0],
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
      drawingAccrualStrategyNames: filterSelectOptions(
        buildSelectOptionsFromStrings(drawingAccrualStrategyNames),
        facilityType.drawingAccrualStrategies,
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
  ): Promise<CreateDrawingNjkInput> {
    const facility = await tryGetApiData<Facility>(`facility/${facilityId}`)
    if (!facility) {
      throw new Error('No facility found')
    }
    return {
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
