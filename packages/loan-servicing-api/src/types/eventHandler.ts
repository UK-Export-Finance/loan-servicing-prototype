import {
  Drawing,
  Transaction,
  ProjectedEvent,
  Facility,
} from 'loan-servicing-common'

export type EventContext<
  E extends Facility | Drawing,
  T extends ProjectedEvent,
> = {
  entity: E
  sourceEvent: T
  transactions: Transaction[]
  eventIndex: number
  allEvents: ProjectedEvent[]
}

export type EventHandler<
  E extends Facility | Drawing,
  T extends ProjectedEvent,
> = (
  eventProps: EventContext<E, T>,
  mutableTransactions: Transaction[],
) => Transaction[]

export type IEventHandlerService<
  E extends Facility | Drawing,
  T extends ProjectedEvent,
> = {
  [key in T['type']]: EventHandler<E, Extract<T, { type: key }>>
} & {
  applyEvent: (eventProps: EventContext<E, T>) => Transaction[]
  getProjectedEvents: (entity: E) => Promise<T[]>
}
