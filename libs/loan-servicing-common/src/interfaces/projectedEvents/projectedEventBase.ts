import { EntityWithEvents, EventBase, UntypedEvent } from '../events/eventBase'

export type ProjectEvent<T extends UntypedEvent> = Pick<
  T,
  'effectiveDate' | 'eventData' | 'type' | 'streamId' | 'entityType' | 'shouldProcessIfFuture'
>

export type ProjectedEventBase<
  Type extends string,
  Version extends number,
  Data extends object,
  Entity extends EntityWithEvents,
> = ProjectEvent<EventBase<Type, Version, Data, Entity>>

export type ProjectedDrawingEventBase<
  Type extends string,
  Version extends number,
  Data extends object,
> = ProjectedEventBase<Type, Version, Data, 'drawing'>

export type ProjectedFacilityEventBase<
  Type extends string,
  Version extends number,
  Data extends object,
> = ProjectedEventBase<Type, Version, Data, 'facility'>
