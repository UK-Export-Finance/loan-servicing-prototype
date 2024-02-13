type EventBase<Type extends string, Version extends number, Data extends object> = {
  streamId: number
  streamVersion: number
  type: Type
  typeVersion: Version
  eventData: Data
}

export type UntypedEvent = EventBase<string, number, object>

export default EventBase
