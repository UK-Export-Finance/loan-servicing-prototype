export type EventBase<
  Type extends string,
  Version extends number,
  Data extends object,
> = {
  streamId: string
  streamVersion: number
  type: Type
  typeVersion: Version
  eventData: Data
}
