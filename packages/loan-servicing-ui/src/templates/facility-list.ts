import { DrawingDto, FacilityType } from 'loan-servicing-common'
import { NunjuckSelectInputOption } from 'types/nunjucks'

export type FacilityListNjkInput = {
  allFacilities: DrawingDto[] | null
  allFacilityTypes: FacilityType[] | null
  facilityTypeNames: NunjuckSelectInputOption<string>[]
}
