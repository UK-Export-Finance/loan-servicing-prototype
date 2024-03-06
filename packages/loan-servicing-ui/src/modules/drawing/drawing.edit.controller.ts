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
  AddWithdrawalToDrawingDto,
  ConvertToDtoType,
  RevertWithdrawlDto,
  UpdateDrawingInterestRequestDto,
} from 'loan-servicing-common'
import { getDateFromDateInput } from 'utils/form-helpers'
import {
  ChangeInterestNjkInput,
  FacilityInterestRateUpdateFormDto,
} from 'templates/facility-edit/change-interest'
import {
  AddWithdrawalToDrawingFormDto,
  AddWithdrawalToDrawingNjkInput,
} from 'templates/facility-edit/add-withdrawal'
import mapEventsToTable from 'mappers/nunjuck-mappers/eventTable'
import mapTransactionsToTable from 'mappers/nunjuck-mappers/transactionTable'
import { RevertWithdrawalNjkInput } from 'templates/facility-edit/revert-withdrawal'
import DrawingService from './drawing.service'

@Controller('facility/:facilityId/drawing')
class EditDrawingController {
  constructor(private drawingService: DrawingService) {}

  @Get(':drawingId/add-withdrawal')
  @Render('facility-edit/add-withdrawal')
  async renderAddDrawingPage(
    @Param('facilityId') facilityId: string,
    @Param('drawingId') drawingId: string,
  ): Promise<AddWithdrawalToDrawingNjkInput> {
    const drawing = await this.drawingService.getDrawing(facilityId, drawingId)
    if (!drawing) {
      throw new NotFoundException()
    }
    return {
      drawing,
    }
  }

  @Post(':drawingId/add-withdrawal')
  async addWithdrawal(
    @Param('facilityId') facilityId: string,
    @Param('drawingId') drawingId: string,
    @Query('version') version: string,
    @Body()
    requestDto: AddWithdrawalToDrawingFormDto,
    @Res() response: Response,
  ): Promise<void> {
    const addDrawingDto: AddWithdrawalToDrawingDto = {
      date: getDateFromDateInput(requestDto, 'date'),
      amount: requestDto.amount,
    }
    await this.drawingService.addWithdrawalToDrawing(
      facilityId,
      drawingId,
      version,
      addDrawingDto,
    )
    response.redirect(`/facility/${facilityId}/drawing/${drawingId}`)
  }

  @Get(':drawingId/changeInterest')
  @Render('facility-edit/change-interest')
  async renderInterestChangePage(
    @Param('facilityId') facilityId: string,
    @Param('drawingId') drawingId: string,
  ): Promise<ChangeInterestNjkInput> {
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
      eventRows: mapEventsToTable(events!),
      transactionRows: mapTransactionsToTable(transactionRows!),
    }
  }

  @Post(':drawingId/changeInterest')
  async updateInterest(
    @Param('facilityId') facilityId: string,
    @Param('drawingId') drawingId: string,
    @Query('version') version: string,
    @Body()
    requestDto: FacilityInterestRateUpdateFormDto,
    @Res() response: Response,
  ): Promise<void> {
    const updateDto: UpdateDrawingInterestRequestDto = {
      effectiveDate: getDateFromDateInput(
        requestDto,
        'effectiveDate',
      ).toISOString(),
      interestRate: requestDto.interestRate,
    }
    await this.drawingService.updateInterest(
      facilityId,
      drawingId,
      version,
      updateDto,
    )
    response.redirect(`/facility/${facilityId}/drawing/${drawingId}`)
  }

  @Get(':drawingId/withdrawal/:withdrawalId/revert')
  @Render('facility-edit/revert-withdrawal')
  async renderRevertWithdrawalPage(
    @Param('facilityId') facilityId: string,
    @Param('drawingId') drawingId: string,
    @Param('withdrawalId') withdrawalId: number,
  ): Promise<RevertWithdrawalNjkInput> {
    const drawing = await this.drawingService.getDrawing(facilityId, drawingId)
    if (!drawing) {
      throw new NotFoundException()
    }
    const transactionRows = await this.drawingService.getDrawingTransactionRows(
      facilityId,
      drawingId,
    )

    const withdrawal = transactionRows?.find(
      (t) => t.sourceEvent?.streamVersion === withdrawalId,
    )

    if (!withdrawal) {
      throw new NotFoundException('No withdrawal found')
    }

    return {
      drawing,
      revertWithdrawalDto: {
        drawingStreamId: drawingId,
        dateOfWithdrawal: new Date(withdrawal?.datetime).toISOString(),
        withdrawalEventStreamVersion: withdrawalId.toString(),
      },
    }
  }

  @Post(':drawingId/withdrawal/revert')
  async revertWithdrawal(
    @Param('facilityId') facilityId: string,
    @Param('drawingId') drawingId: string,
    @Query('version') version: string,
    @Body()
    requestDto: ConvertToDtoType<RevertWithdrawlDto>,
    @Res() response: Response,
  ): Promise<void> {
    await this.drawingService.revertWithdrawal(facilityId, drawingId, version, {
      ...requestDto,
      dateOfWithdrawal: new Date(requestDto.dateOfWithdrawal),
      withdrawalEventStreamVersion: Number(
        requestDto.withdrawalEventStreamVersion,
      ),
    })
    response.redirect(`/facility/${facilityId}/drawing/${drawingId}`)
  }
}

export default EditDrawingController
