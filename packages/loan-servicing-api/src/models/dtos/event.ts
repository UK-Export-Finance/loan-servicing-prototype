import { EntityWithEvents, UntypedEvent } from 'loan-servicing-common'

// eslint-disable-next-line import/prefer-default-export
export class UntypedEventClass implements UntypedEvent {
  id!: number
  
  streamId!: string

  streamVersion!: number

  eventDate!: Date

  effectiveDate!: Date

  entityType!: EntityWithEvents

  isSoftDeleted!: boolean

  type!: string

  typeVersion!: number

  eventData!: object

  shouldProcessIfFuture!: boolean

  isApproved!: boolean
}
