import { Injectable } from '@nestjs/common'
import { postApiData, tryGetApiData } from 'api/base-client'
import {
  LoanServicingEvent,
  DrawingDto,
  UpdateDrawingInterestRequestDto,
  AddWithdrawalToDrawingDto,
  NewDrawingRequestDto,
  DrawingTransaction,
} from 'loan-servicing-common'
import getEventTableRow, {
  getTransactionTableRow,
} from 'mappers/nunjuck-mappers/eventTable'
import { NunjuckTableRow } from 'types/nunjucks'
import { buildNunjucksTableRow } from 'utils/nunjucks-parsers'

@Injectable()
class DrawingService {
  async createDrawing(
    facilityId: string,
    drawingRequest: NewDrawingRequestDto,
  ): Promise<DrawingDto | null> {
    const newDrawing = await postApiData<DrawingDto>(
      `facility/${facilityId}/drawing`,
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
  ): Promise<NunjuckTableRow[] | null> {
    const events = await tryGetApiData<LoanServicingEvent[]>(
      `facility/${facilityStreamId}/drawing/${drawingStreamId}/events`,
    )
    return (
      events
        ?.map(getEventTableRow)
        .map((e) =>
          buildNunjucksTableRow(e, [
            'eventDate',
            'event',
            'description',
            'effectiveDate',
          ]),
        ) || null
    )
  }

  async getDrawingTransactionRows(
    facilityStreamId: string,
    drawingStreamId: string,
  ): Promise<NunjuckTableRow[] | null> {
    const transactions = await tryGetApiData<DrawingTransaction[]>(
      `facility/${facilityStreamId}/drawing/${drawingStreamId}/transactions?interestResolution=monthly`,
    )
    return (
      transactions
        ?.map(getTransactionTableRow)
        .map((e) =>
          buildNunjucksTableRow(e, [
            'date',
            'reference',
            'transactionAmount',
            'balance',
            'interestAccrued',
          ]),
        ) || null
    )
  }
}

export default DrawingService
