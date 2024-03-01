import { ClassConstructor } from 'class-transformer'
import { EventTypes, LoanServicingEvent } from 'loan-servicing-common'
import {
  AdjustFacilityPrincipalDtoClass,
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
  AdjustFacilityPrincipal: AdjustFacilityPrincipalDtoClass,
}

export default eventTypeToEventClassDefinition
