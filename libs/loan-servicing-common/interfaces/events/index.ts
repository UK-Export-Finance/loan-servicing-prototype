import { EventBase } from './eventBase'
import FacilityEvent from './facilityEvents'

export type Event = FacilityEvent | EventBase<'OtherEvent', 1, { randomProp: string }>

export type EventTypes = Event['type']
