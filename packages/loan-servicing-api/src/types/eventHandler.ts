import { ProjectedEvent } from 'loan-servicing-common'
import FacilityProjection from 'modules/projections/projection'

export type EventHandler<T extends ProjectedEvent> = (
  event: T,
  projection: FacilityProjection,
) => Promise<void>

export type IEventHandlerService<T extends ProjectedEvent> = {
  [key in T['type']]: EventHandler<Extract<T, { type: key }>>
} & {
  applyEvent: (event: T, projection: FacilityProjection) => Promise<void>
}
