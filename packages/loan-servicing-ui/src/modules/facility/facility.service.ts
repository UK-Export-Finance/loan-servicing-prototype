import { Injectable, NotImplementedException } from '@nestjs/common'
import { postApiData, tryGetApiData } from 'api/base-client'
import {
  LoanServicingEvent,
  NewFacilityRequestDto,
  FacilityTransaction,
  FacilityDto,
  AdjustFacilityPrincipalDto,
  UpdateInterestRequestDto,
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
    case 'AdjustFacilityPrincipal':
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

@Injectable()
class FacilityService {
  async createFacility(
    facility: NewFacilityRequestDto,
  ): Promise<FacilityDto | null> {
    const newFacility = await postApiData<FacilityDto>('facility/new', facility)
    return newFacility
  }

  async adjustPrincipal(
    streamId: string,
    streamVersion: string,
    adjustment: AdjustFacilityPrincipalDto,
  ): Promise<void> {
    await postApiData(
      `facility/${streamId}/adjustPrincipal?version=${streamVersion}`,
      adjustment,
    )
  }

  async updateInterest(
    streamId: string,
    streamVersion: string,
    update: UpdateInterestRequestDto,
  ): Promise<void> {
    await postApiData(
      `facility/${streamId}/updateInterestRate?version=${streamVersion}`,
      update,
    )
  }

  async getFacility(streamId: string): Promise<FacilityDto | null> {
    const facility = await tryGetApiData<FacilityDto>(`facility/${streamId}`)
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
      `facility/${streamId}/transactions`,
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
          ]),
        ) || null
    )
  }
}

export default FacilityService
