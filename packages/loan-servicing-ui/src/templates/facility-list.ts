import { FacilityDto, FacilityType } from "loan-servicing-common";
import { NunjuckSelectInputOption } from "types/nunjucks";

export type FacilityListNjkInput = {
    allFacilities: FacilityDto[] | null
    allFacilityTypes: FacilityType[] | null
    facilityTypeNames: NunjuckSelectInputOption<string>[]
  }