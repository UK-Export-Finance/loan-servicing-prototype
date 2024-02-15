import { Facility } from '../interfaces/facility'

export type NewFacilityRequestDto = Omit<Facility, 'streamId'>

export type UpdateFacilityRequestDto = Partial<NewFacilityRequestDto>
