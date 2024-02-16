import EventBase from './eventBase'
import FacilityEvent from './facilityEvents'

type Event = FacilityEvent | EventBase<'OtherEvent', 1, { randomProp: string }>

export type NewEvent<E extends Event> = Omit<E, 'streamVersion'>

export type EventTypes = Event['type']

export default Event
