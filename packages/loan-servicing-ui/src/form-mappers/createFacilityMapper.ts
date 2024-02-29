import { NewFacilityRequestDto } from 'loan-servicing-common'
import { NewFacilityRequestFormDto } from 'templates/create-facility'
import { getDateFromDateInput } from 'utils/form-helpers'
import mapRepaymentOptions from './repaymentOptionMappers'

const mapCreateFacilityFormToRequest = (
  facilityType: string,
  request: NewFacilityRequestFormDto,
): NewFacilityRequestDto => ({
  facilityType,
  ...request,
  facilityConfig: {
    calculateInterestStrategy: {
      name: request.calculateInterestStrategy,
    },
    repaymentsStrategy: mapRepaymentOptions(request),
  },
  expiryDate: getDateFromDateInput(request, 'expiryDate'),
  issuedEffectiveDate: getDateFromDateInput(request, 'issuedEffectiveDate'),
})

export default mapCreateFacilityFormToRequest
