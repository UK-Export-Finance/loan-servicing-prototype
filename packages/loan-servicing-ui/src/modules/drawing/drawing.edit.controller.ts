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
  AddFixedDrawingAccrualDto,
  AddMarketDrawingAccrualDto,
  AddWithdrawalToDrawingDto,
  ConvertToDtoType,
  RecordDrawingAccrualPaymentDto,
  RecordDrawingRepaymentDto,
  RevertWithdrawlDto,
} from 'loan-servicing-common'
import { getDateFromDateInput } from 'utils/form-helpers'
import {
  AddWithdrawalToDrawingFormDto,
  AddWithdrawalToDrawingNjkInput,
} from 'templates/facility-edit/add-withdrawal'
import { RevertWithdrawalNjkInput } from 'templates/facility-edit/revert-withdrawal'
import {
  AddDrawingAccrualNjkInput,
  AddFixedDrawingAccrualFormDto,
  AddMarketDrawingAccrualFormDto,
} from 'templates/drawing-edit/add-accrual'
import {
  RecordRepaymentFormDto,
  RecordRepaymentNjkInput,
} from 'templates/drawing-edit/record-repayment'
import {
  RecordAccrualPaymentFormDto,
  RecordAccrualRepaymentNjkInput,
} from 'templates/drawing-edit/record-accrual-payment'
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

  @Get(':drawingId/addAccrual')
  @Render('drawing-edit/add-accrual')
  async renderAddAccrualPage(
    @Param('facilityId') facilityId: string,
    @Param('drawingId') drawingId: string,
  ): Promise<AddDrawingAccrualNjkInput> {
    const drawing = await this.drawingService.getDrawing(facilityId, drawingId)
    if (!drawing) {
      throw new NotFoundException()
    }

    return {
      drawing,
    }
  }

  @Post(':drawingId/accrual/fixed')
  async addFixedAccrual(
    @Param('facilityId') facilityId: string,
    @Param('drawingId') drawingId: string,
    @Query('version') version: string,
    @Body()
    requestDto: AddFixedDrawingAccrualFormDto,
    @Res() response: Response,
  ): Promise<void> {
    const updateDto: AddFixedDrawingAccrualDto = {
      effectiveDate: getDateFromDateInput(requestDto, 'effectiveDate'),
      expiryDate: getDateFromDateInput(requestDto, 'expiryDate'),
      monthsBetweenPayment: 2,
      accrualRate: requestDto.accrualRate,
    }
    await this.drawingService.addFixedDrawingAccrual(
      facilityId,
      drawingId,
      version,
      updateDto,
    )
    response.redirect(`/facility/${facilityId}/drawing/${drawingId}`)
  }

  @Post(':drawingId/accrual/market')
  async addMarketAccrual(
    @Param('facilityId') facilityId: string,
    @Param('drawingId') drawingId: string,
    @Query('version') version: string,
    @Body()
    requestDto: AddMarketDrawingAccrualFormDto,
    @Res() response: Response,
  ): Promise<void> {
    const updateDto: AddMarketDrawingAccrualDto = {
      effectiveDate: getDateFromDateInput(requestDto, 'effectiveDate'),
      expiryDate: getDateFromDateInput(requestDto, 'expiryDate'),
      monthsBetweenPayment: 2,
      accrualRate: requestDto.accrualRate,
    }
    await this.drawingService.addMarketDrawingAccrual(
      facilityId,
      drawingId,
      version,
      updateDto,
    )
    response.redirect(`/facility/${facilityId}/drawing/${drawingId}`)
  }

  @Get(':drawingId/recordRepayment')
  @Render('drawing-edit/record-repayment')
  async renderRecordRepaymentPage(
    @Param('facilityId') facilityId: string,
    @Param('drawingId') drawingId: string,
    @Query('repaymentId') repaymentId: string,
  ): Promise<RecordRepaymentNjkInput> {
    const drawing = await this.drawingService.getDrawing(facilityId, drawingId)
    if (!drawing) {
      throw new NotFoundException('Drawing not found')
    }
    const repayment = drawing.repayments.find((r) => r.id === repaymentId)
    if (!repayment) {
      throw new NotFoundException('Repayment not found')
    }
    return {
      drawing,
      repayment,
    }
  }

  @Post(':drawingId/recordRepayment')
  async recordRepayment(
    @Param('facilityId') facilityId: string,
    @Param('drawingId') drawingId: string,
    @Query('version') version: string,
    @Body()
    requestDto: RecordRepaymentFormDto,
    @Res() response: Response,
  ): Promise<void> {
    const updateDto: RecordDrawingRepaymentDto = {
      date: new Date(requestDto.repaymentDate),
      amount: requestDto.amount,
      repaymentId: requestDto.repaymentId,
    }
    await this.drawingService.recordRepayment(
      facilityId,
      drawingId,
      version,
      updateDto,
    )
    response.redirect(`/facility/${facilityId}/drawing/${drawingId}`)
  }

  @Get(':drawingId/recordAccrualPayment')
  @Render('drawing-edit/record-accrual-payment')
  async renderRecordAccrualPage(
    @Param('facilityId') facilityId: string,
    @Param('drawingId') drawingId: string,
    @Query('accrualId') accrualId: string,
  ): Promise<RecordAccrualRepaymentNjkInput> {
    const drawing = await this.drawingService.getDrawing(facilityId, drawingId)
    if (!drawing) {
      throw new NotFoundException('Drawing not found')
    }
    const accrual = drawing.accruals.find((a) => a.id === accrualId)
    if (!accrual) {
      throw new NotFoundException('Accrual not found')
    }
    return {
      drawing,
      accrual,
    }
  }

  @Post(':drawingId/accuralPaymentReceived')
  async recordAccrualPayment(
    @Param('facilityId') facilityId: string,
    @Param('drawingId') drawingId: string,
    @Query('version') version: string,
    @Body()
    requestDto: RecordAccrualPaymentFormDto,
    @Res() response: Response,
  ): Promise<void> {
    const updateDto: RecordDrawingAccrualPaymentDto = {
      date: new Date(requestDto.date),
      amount: requestDto.amount,
      accrualId: requestDto.accrualId,
    }
    await this.drawingService.recordAccrualPayment(
      facilityId,
      drawingId,
      version,
      updateDto,
    )
    response.redirect(`/facility/${facilityId}/drawing/${drawingId}`)
  }

  @Get(':drawingId/approveEvent')
  async approveDrawingEvent(
    @Param('facilityId') facilityId: string,
    @Param('drawingId') drawingId: string,
    @Query('id') id: number,
    @Res() response: Response,
  ): Promise<void> {
    await this.drawingService.approveEvent(
      facilityId,
      drawingId,
      id
    )
    response.redirect(`/facility/${facilityId}/drawing/${drawingId}`)
  }
}

export default EditDrawingController
