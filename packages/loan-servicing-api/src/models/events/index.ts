import FacilityEvent from "./facilityEvents";

type Event = FacilityEvent

export type NewEvent<
  E extends Event,
> = Omit<E, 'streamVersion'>

export default Event