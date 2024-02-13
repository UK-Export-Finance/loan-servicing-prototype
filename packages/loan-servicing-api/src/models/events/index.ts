import FacilityEvent from "./facilityEvents";

type Event = FacilityEvent

export type EventRequest<
  E extends Event,
> = Omit<E, 'streamVersion'>

export default Event