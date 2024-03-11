import {
  Drawing,
  Transaction,
  ProjectedEvent,
  Facility,
} from 'loan-servicing-common'
import FacilityProjection from 'modules/projections/projection'

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

export type EventHandler<T extends ProjectedEvent> = (
  event: T,
  projection: FacilityProjection,
) => Promise<void>

export type IEventHandlerService<
  E extends Facility | Drawing,
  T extends ProjectedEvent,
> = {
  [key in T['type']]: EventHandler<Extract<T, { type: key }>>
} & {
  applyEvent: (event: T, projection: FacilityProjection) => Promise<void>
  getProjectedEvents: (entity: E) => Promise<T[]>
}
