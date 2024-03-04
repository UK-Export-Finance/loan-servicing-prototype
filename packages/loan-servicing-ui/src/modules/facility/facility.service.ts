import { Injectable, NotImplementedException } from '@nestjs/common'
import { postApiData, tryGetApiData } from 'api/base-client'
import {
  LoanServicingEvent,
  NewFacilityRequestDto,
  FacilityTransaction,
  DrawingDto,
  AdjustFacilityAmountDto,
  UpdateDrawingInterestRequestDto,
  AddWithdrawalToDrawingDto,
} from 'loan-servicing-common'
import { EventTableRow } from 'types/events'
import { NunjuckTableRow } from 'types/nunjucks'
import { TransactionTableRow } from 'types/transactions'
import { buildNunjucksTableRow } from 'utils/nunjucks-parsers'

const getEventTableRow = (event: LoanServicingEvent): EventTableRow => {
  const { eventDate, effectiveDate } = event
  const eventDateObj = new Date(eventDate)
  const effectiveDateObj = new Date(effectiveDate)
  switch (event.type) {
    case 'CreateNewFacility':
      return {
        event: 'Facility created',
        eventDate: eventDateObj.toLocaleString('en-GB'),
        effectiveDate: effectiveDateObj.toLocaleString('en-GB'),
        description: 'Facility created with intial values',
      }
    case 'AdjustFacilityMaxPrincipal':
      const { adjustment } = event.eventData
      return {
        event: 'Facility principal adjusted',
        eventDate: eventDateObj.toLocaleString('en-GB'),
        effectiveDate: effectiveDateObj.toLocaleString('en-GB'),
        description: `Facility principal was ${Number(adjustment) > 0 ? 'increased' : 'decreased'} by ${Math.abs(Number(adjustment))}.`,
      }
    case 'UpdateInterest':
      return {
        event: 'Interest Updated',
        eventDate: eventDateObj.toLocaleString('en-GB'),
        effectiveDate: effectiveDateObj.toLocaleString('en-GB'),
        description: `Interest rate was changed to ${event.eventData.interestRate}%.`,
      }
      case 'AddDrawing':
      return {
        event: 'Drawing Added',
        eventDate: eventDateObj.toLocaleString('en-GB'),
        effectiveDate: effectiveDateObj.toLocaleString('en-GB'),
        description: `£${event.eventData.amount} was drawn.`,
      }
    default:
      throw new NotImplementedException()
  }
}

const getTransactionTableRow = (
  transaction: FacilityTransaction,
): TransactionTableRow => ({
  date: new Date(transaction.datetime).toLocaleDateString('en-GB'),
  reference: transaction.reference,
  transactionAmount:
    transaction.principalChange === '0'
      ? transaction.interestChange
      : transaction.principalChange,
  balance: transaction.balanceAfterTransaction,
  interestAccrued: transaction.interestAccrued,
})

@Injectable()
class FacilityService {
  async createFacility(
    facility: NewFacilityRequestDto,
  ): Promise<DrawingDto | null> {
    const newFacility = await postApiData<DrawingDto>('facility/new', facility)
    return newFacility
  }

  async adjustPrincipal(
    streamId: string,
    streamVersion: string,
    adjustment: AdjustFacilityAmountDto,
  ): Promise<void> {
    await postApiData(
      `facility/${streamId}/adjustPrincipal?version=${streamVersion}`,
      adjustment,
    )
  }

  async addDrawing(
    streamId: string,
    streamVersion: string,
    drawing: AddWithdrawalToDrawingDto,
  ): Promise<void> {
    await postApiData(
      `facility/${streamId}/drawing?version=${streamVersion}`,
      drawing,
    )
  }

  async updateInterest(
    streamId: string,
    streamVersion: string,
    update: UpdateDrawingInterestRequestDto,
  ): Promise<void> {
    await postApiData(
      `facility/${streamId}/updateInterestRate?version=${streamVersion}`,
      update,
    )
  }

  async getFacility(streamId: string): Promise<DrawingDto | null> {
    const facility = await tryGetApiData<DrawingDto>(`facility/${streamId}`)
    return facility
  }

  async getFacilityEventTableRows(
    streamId: string,
  ): Promise<NunjuckTableRow[] | null> {
    const events = await tryGetApiData<LoanServicingEvent[]>(
      `facility/${streamId}/events`,
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

  async getFacilityTransactionRows(
    streamId: string,
  ): Promise<NunjuckTableRow[] | null> {
    const transactions = await tryGetApiData<FacilityTransaction[]>(
      `facility/${streamId}/transactions?interestResolution=monthly`,
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

export default FacilityService
