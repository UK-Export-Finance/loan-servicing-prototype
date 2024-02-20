export type EventBase<
  Type extends string,
  Version extends number,
  Data extends object,
> = {
  streamId: string
  streamVersion: number
  eventDate: Date
  effectiveDate: Date
  type: Type
  typeVersion: Version
  eventData: Data
}
