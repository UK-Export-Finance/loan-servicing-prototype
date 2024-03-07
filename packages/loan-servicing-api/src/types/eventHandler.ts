import {
  Drawing,
  Transaction,
  DrawingProjectedEvent,
  ProjectedEvent,
} from 'loan-servicing-common'

export type EventHandlerProps<T extends ProjectedEvent> = {
  drawingEntity: Drawing
  sourceEvent: T
  transactions: Transaction[]
  eventIndex: number
  allEvents: DrawingProjectedEvent[]
}

export type EventHandler<T extends ProjectedEvent> = (
  eventProps: EventHandlerProps<T>,
  mutableTransactions: Transaction[]
) => Transaction[]

export type IHasEventHandlers<T extends ProjectedEvent> = {
  [key in T['type']]: EventHandler<Extract<T, { type: key }>>
}
