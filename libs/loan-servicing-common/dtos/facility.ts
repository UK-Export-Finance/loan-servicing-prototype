import { Facility } from "interfaces/facility";

export type NewFacilityRequestDto = Omit<Facility, 'streamId'>
