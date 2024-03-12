import { NewFacilityRequestDto } from 'loan-servicing-common'
import { NewFacilityRequestFormDto } from 'templates/create-facility'
import { getDateFromDateInput } from 'utils/form-helpers'

const mapCreateFacilityFormToRequest = (
  request: NewFacilityRequestFormDto,
): NewFacilityRequestDto => ({
  ...request,
  facilityAmount: request.maxPrincipal,
  expiryDate: getDateFromDateInput(request, 'expiryDate'),
  issuedEffectiveDate: getDateFromDateInput(request, 'issuedEffectiveDate'),
})

export default mapCreateFacilityFormToRequest
