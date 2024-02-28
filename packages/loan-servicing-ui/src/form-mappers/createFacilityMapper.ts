import { NewFacilityRequestDto } from 'loan-servicing-common'
import { NewFacilityRequestFormDto } from 'types/dtos/facility.dto'
import { getDateFromDateInput } from 'utils/form-helpers'

const mapCreateFacilityFormToRequest = (
  request: NewFacilityRequestFormDto,
): NewFacilityRequestDto => ({
  ...request,
  facilityConfig: {
    calculateInterestStrategy: {
      name: request.calculateInterestStrategy,
    },
  },
  expiryDate: getDateFromDateInput(request, 'expiryDate'),
  issuedEffectiveDate: getDateFromDateInput(request, 'issuedEffectiveDate'),
})

export default mapCreateFacilityFormToRequest
