import { Injectable } from '@nestjs/common'
import { postApiData, tryGetApiData } from 'api/base-client'
import {
  LoanServicingEvent,
  DrawingDto,
  AddWithdrawalToDrawingDto,
  NewDrawingRequestDto,
  Transaction,
  RevertWithdrawlDto,
  AddFixedDrawingAccrualDto,
  AddMarketDrawingAccrualDto,
  RecordDrawingRepaymentDto,
  RecordDrawingAccrualPaymentDto,
} from 'loan-servicing-common'

@Injectable()
class DrawingService {
  async createDrawing(
    facilityId: string,
    facilityVersion: number,
    drawingRequest: NewDrawingRequestDto,
  ): Promise<DrawingDto | null> {
    const newDrawing = await postApiData<DrawingDto>(
      `facility/${facilityId}/drawing?facilityVersion=${facilityVersion}`,
      drawingRequest,
    )
    return newDrawing
  }

  async addWithdrawalToDrawing(
    facilityStreamId: string,
    drawingStreamId: string,
    streamVersion: string,
    drawing: AddWithdrawalToDrawingDto,
  ): Promise<void> {
    await postApiData(
      `facility/${facilityStreamId}/drawing/${drawingStreamId}/withdrawal?version=${streamVersion}`,
      drawing,
    )
  }

  async revertWithdrawal(
    facilityStreamId: string,
    drawingStreamId: string,
    streamVersion: string,
    update: RevertWithdrawlDto,
  ): Promise<void> {
    await postApiData(
      `facility/${facilityStreamId}/drawing/${drawingStreamId}/withdrawal/revert?version=${streamVersion}`,
      update,
    )
  }

  async getDrawing(
    facilityStreamId: string,
    drawingStreamId: string,
  ): Promise<DrawingDto | null> {
    const facility = await tryGetApiData<DrawingDto>(
      `facility/${facilityStreamId}/drawing/${drawingStreamId}${process.env.DEV_MODE ? '' : ''}`,
    )
    return facility
  }

  async getDrawingApprovalEvents(
    facilityStreamId: string,
    drawingStreamId: string,
  ): Promise<LoanServicingEvent[] | null> {
    const events = await tryGetApiData<LoanServicingEvent[]>(
      `facility/${facilityStreamId}/drawing/${drawingStreamId}/events/unapproved`,
    )
    return events
  }

  async getDrawingEventTableRows(
    facilityStreamId: string,
    drawingStreamId: string,
  ): Promise<LoanServicingEvent[] | null> {
    const events = await tryGetApiData<LoanServicingEvent[]>(
      `facility/${facilityStreamId}/drawing/${drawingStreamId}/events`,
    )
    return events
  }

  async getDrawingTransactionRows(
    facilityStreamId: string,
    drawingStreamId: string,
  ): Promise<Transaction[] | null> {
    const transactions = await tryGetApiData<Transaction[]>(
      `facility/${facilityStreamId}/drawing/${drawingStreamId}/transactions?interestResolution=monthly`,
    )
    return transactions
  }

  async addFixedDrawingAccrual(
    facilityStreamId: string,
    drawingStreamId: string,
    streamVersion: string,
    dto: AddFixedDrawingAccrualDto,
  ): Promise<void> {
    await postApiData(
      `facility/${facilityStreamId}/drawing/${drawingStreamId}/accrual/fixed?version=${streamVersion}`,
      dto,
    )
  }

  async addMarketDrawingAccrual(
    facilityStreamId: string,
    drawingStreamId: string,
    streamVersion: string,
    dto: AddMarketDrawingAccrualDto,
  ): Promise<void> {
    await postApiData(
      `facility/${facilityStreamId}/drawing/${drawingStreamId}/accrual/market?version=${streamVersion}`,
      dto,
    )
  }

  async recordRepayment(
    facilityStreamId: string,
    drawingStreamId: string,
    streamVersion: string,
    dto: RecordDrawingRepaymentDto,
  ): Promise<void> {
    await postApiData(
      `facility/${facilityStreamId}/drawing/${drawingStreamId}/repaymentReceived?version=${streamVersion}`,
      dto,
    )
  }

  async recordAccrualPayment(
    facilityStreamId: string,
    drawingStreamId: string,
    streamVersion: string,
    dto: RecordDrawingAccrualPaymentDto,
  ): Promise<void> {
    await postApiData(
      `facility/${facilityStreamId}/drawing/${drawingStreamId}/accuralPaymentReceived?version=${streamVersion}`,
      dto,
    )
  }

  async approveEvent(
    facilityStreamId: string,
    drawingStreamId: string,
    eventId: number
  ): Promise<void> {
    await postApiData(
      `facility/${facilityStreamId}/drawing/${drawingStreamId}/approveEvent?id=${eventId}`,
        {}
    )
  }
}

export default DrawingService
