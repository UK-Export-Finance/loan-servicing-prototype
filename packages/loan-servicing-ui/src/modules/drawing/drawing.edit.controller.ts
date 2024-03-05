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
      transactionRows: transactionRows!,
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

  @Get(':id/changeInterest')
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
      eventRows: events!,
      transactionRows: transactionRows!,
    }
  }

  @Post(':id/changeInterest')
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
}

export default EditDrawingController
