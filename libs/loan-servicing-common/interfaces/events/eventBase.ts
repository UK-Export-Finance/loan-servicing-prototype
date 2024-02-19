export type EventBase<
  Type extends string,
  Version extends number,
  Data extends object,
> = {
  streamId: string
  streamVersion: number
  datetime: Date
  type: Type
  typeVersion: Version
  eventData: Data
}
