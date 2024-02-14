type EventBase<
  Type extends string,
  Version extends number,
  Data extends object | null,
> = {
  streamId: string
  streamVersion: number
  type: Type
  typeVersion: Version
  eventData: Data
}

export type UntypedEvent = EventBase<string, number, object | null>

export default EventBase
