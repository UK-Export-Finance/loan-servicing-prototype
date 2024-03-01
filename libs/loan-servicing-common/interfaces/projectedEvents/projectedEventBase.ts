import { EventBase } from '../events/eventBase'

export type ProjectedEventBase<
  Type extends string,
  Version extends number,
  Data extends object,
> = Pick<EventBase<Type, Version, Data>, 'effectiveDate' | 'eventData' | 'type'>
