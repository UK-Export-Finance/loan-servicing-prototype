import { Facility } from '../interfaces/facility'

export type NewFacilityRequestDto = Omit<Facility, 'streamId' | 'streamVersion'>

export type UpdateFacilityRequestDto = Partial<NewFacilityRequestDto>
