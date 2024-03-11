export type EntityWithEvents = 'facility' | 'drawing'

export type EventBase<
  Type extends string,
  Version extends number,
  Data extends object,
  Entity extends EntityWithEvents
> = {
  streamId: string
  streamVersion: number
  eventDate: Date
  effectiveDate: Date
  entityType: Entity
  type: Type
  typeVersion: Version
  isConfigEvent: boolean
  eventData: Data
}

export type UntypedEvent = EventBase<string, number, object, EntityWithEvents>
