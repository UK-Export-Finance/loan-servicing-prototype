import { LoanServicingEvent } from 'loan-servicing-common'

export type EventTableRow = {
  event: string
  date: string
  description: string
}

export type EventTableRowTemplate = (event: LoanServicingEvent) => EventTableRow
