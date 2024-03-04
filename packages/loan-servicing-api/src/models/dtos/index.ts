import { ClassConstructor } from 'class-transformer'
import { EventTypes, LoanServicingEvent } from 'loan-servicing-common'
import {
  AddDrawingDtoClass,
  AdjustFacilityMaxPrincipalDtoClass,
  NewFacilityRequestDtoClass,
  UpdateInterestRequestDtoClass,
} from './facility'

const eventTypeToEventClassDefinition: {
  [key in EventTypes]: ClassConstructor<
    Extract<LoanServicingEvent, { type: key }>['eventData']
  >
} = {
  CreateNewFacility: NewFacilityRequestDtoClass,
  UpdateInterest: UpdateInterestRequestDtoClass,
  AdjustFacilityMaxPrincipal: AdjustFacilityMaxPrincipalDtoClass,
  AddDrawing: AddDrawingDtoClass
}

export default eventTypeToEventClassDefinition
