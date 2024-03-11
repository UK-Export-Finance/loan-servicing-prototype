import { Injectable } from '@nestjs/common'
import { postApiData, tryGetApiData } from 'api/base-client'
import {
  LoanServicingEvent,
  DrawingDto,
  UpdateDrawingInterestRequestDto,
  AddWithdrawalToDrawingDto,
  NewDrawingRequestDto,
  Transaction,
  RevertWithdrawlDto,
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

  async updateInterest(
    facilityStreamId: string,
    drawingStreamId: string,
    streamVersion: string,
    update: UpdateDrawingInterestRequestDto,
  ): Promise<void> {
    await postApiData(
      `facility/${facilityStreamId}/drawing/${drawingStreamId}/updateInterestRate?version=${streamVersion}`,
      update,
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
      `facility/${facilityStreamId}/drawing/${drawingStreamId}`,
    )
    return facility
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
}

export default DrawingService
