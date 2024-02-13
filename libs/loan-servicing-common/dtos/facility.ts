import { Facility } from 'interfaces/facility'

export type FacilityUpdateRequestDto = Omit<Facility, 'streamId'>
