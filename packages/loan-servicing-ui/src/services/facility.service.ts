import { Injectable, NotImplementedException } from '@nestjs/common'
import { postApiData, tryGetApiData } from 'api/base-client'
import {
  LoanServicingEvent,
  NewFacilityRequestDto,
  FacilityTransaction,
  FacilityDto,
  AdjustFacilityPrincipalDto,
} from 'loan-servicing-common'
import { EventTableRow } from 'types/events'
import { NunjuckTableRow } from 'types/nunjucks'
import { TransactionTableRow } from 'types/transactions'

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
    case 'AdjustFacilityPrincipal':
      const { adjustment } = event.eventData
      return {
        event: 'Facility value adjusted',
        eventDate: eventDateObj.toLocaleString('en-GB'),
        effectiveDate: effectiveDateObj.toLocaleString('en-GB'),
        description: `Facility principal was ${Number(adjustment) > 0 ? 'increased' : 'decreased'} by ${Math.abs(Number(adjustment))}.`,
      }
    case 'UpdateInterest':
      const updatedEntries = Object.entries(event.eventData)
      return {
        event: 'Facility property changed',
        eventDate: eventDateObj.toLocaleString('en-GB'),
        effectiveDate: effectiveDateObj.toLocaleString('en-GB'),
        description: updatedEntries
          .map(
            ([property, newValue]) =>
              `Property '${property}' was changed to '${newValue}'.`,
          )
          .join('\n'),
      }
    default:
      throw new NotImplementedException()
  }
}

const getTransactionTableRow = (
  transaction: FacilityTransaction,
): TransactionTableRow => ({
  date: new Date(transaction.datetime).toLocaleString('en-GB'),
  reference: transaction.reference,
  transactionAmount: transaction.transactionAmount.toString(),
  balance: transaction.balanceAfterTransaction.toString(),
})

const eventTableRowToNunjucksTableRow = (r: EventTableRow): NunjuckTableRow =>
  [r.eventDate, r.event, r.description, r.effectiveDate].map((c) => ({
    text: c,
  }))

const transactionRowToNunjucksRow = (r: TransactionTableRow): NunjuckTableRow =>
  [r.date, r.reference, r.transactionAmount, r.balance].map((c) => ({
    text: c,
  }))

@Injectable()
class FacilityService {
  async createFacility(
    facility: NewFacilityRequestDto,
  ): Promise<FacilityDto | null> {
    const newFacility = await postApiData<FacilityDto>('facility', facility)
    return newFacility
  }

  async adjustPrincipal(
    streamId: string,
    streamVersion: string,
    adjustment: AdjustFacilityPrincipalDto,
  ): Promise<void> {
    await postApiData(
      `facility/${streamId}/${streamVersion}/adjustPrincipal`,
      adjustment,
    )
  }

  async getFacility(streamId: string): Promise<FacilityDto | null> {
    const facility = await tryGetApiData<FacilityDto>(`facility?id=${streamId}`)
    return facility
  }

  async getFacilityEventTableRows(
    streamId: string,
  ): Promise<NunjuckTableRow[] | null> {
    const events = await tryGetApiData<LoanServicingEvent[]>(
      `facility/events?id=${streamId}`,
    )
    return (
      events?.map(getEventTableRow).map(eventTableRowToNunjucksTableRow) || null
    )
  }

  async getFacilityTransactionRows(
    streamId: string,
  ): Promise<NunjuckTableRow[] | null> {
    const transactions = await tryGetApiData<FacilityTransaction[]>(
      `facility/transactions?id=${streamId}`,
    )
    console.log(transactions)
    return (
      transactions
        ?.map(getTransactionTableRow)
        .map(transactionRowToNunjucksRow) || null
    )
  }
}

export default FacilityService
