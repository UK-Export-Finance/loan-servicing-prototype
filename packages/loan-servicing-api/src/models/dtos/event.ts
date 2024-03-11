import { EntityWithEvents, UntypedEvent } from 'loan-servicing-common'

// eslint-disable-next-line import/prefer-default-export
export class UntypedEventClass implements UntypedEvent {
  streamId!: string

  streamVersion!: number

  eventDate!: Date

  effectiveDate!: Date

  entityType!: EntityWithEvents

  type!: string

  typeVersion!: number

  isConfigEvent!: boolean

  eventData!: object
}
