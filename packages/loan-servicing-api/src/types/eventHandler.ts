import { ProjectedEvent } from 'loan-servicing-common'
import FacilityBuilder from 'modules/projections/FacilityBuilder'

export type EventHandler<T extends ProjectedEvent> = (
  event: T,
  projection: FacilityBuilder,
) => Promise<void>

export type IEventHandlerService<T extends ProjectedEvent> = {
  [key in T['type']]: EventHandler<Extract<T, { type: key }>>
} & {
  applyEvent: (event: T, projection: FacilityBuilder) => Promise<void>
}
