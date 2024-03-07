import { NotImplementedException } from '@nestjs/common'
import { Transaction, LoanServicingEvent } from 'loan-servicing-common'
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
    case 'AdjustFacilityAmount':
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
    case 'WithdrawFromDrawing':
      return {
        event: 'Withdrawal from drawing',
        eventDate: eventDateObj.toLocaleString('en-GB'),
        effectiveDate: effectiveDateObj.toLocaleString('en-GB'),
        description: `£${event.eventData.amount} was drawn.`,
      }
    case 'CreateNewDrawing':
      return {
        event: 'Drawing Created',
        eventDate: eventDateObj.toLocaleString('en-GB'),
        effectiveDate: effectiveDateObj.toLocaleString('en-GB'),
        description: `Drawing created.`,
      }
    case 'RevertWithdrawal':
      return {
        event: 'Withdrawal Reverted',
        eventDate: eventDateObj.toLocaleString('en-GB'),
        effectiveDate: effectiveDateObj.toLocaleString('en-GB'),
        description: `Withdrawl ${event.eventData.withdrawalEventStreamVersion} was reverted.`,
      }
    default:
      throw new NotImplementedException('Event to event table')
  }
}

export const getTransactionTableRow = (
  transaction: Transaction,
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

const mapEventsToTable = (events: LoanServicingEvent[]): NunjuckTableRow[] =>
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

export default mapEventsToTable
