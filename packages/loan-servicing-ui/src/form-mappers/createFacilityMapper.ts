import { NewFacilityRequestDto } from 'loan-servicing-common'
import { NewFacilityRequestFormDto } from 'types/dtos/facility.dto'
import { getDateFromDateInput } from 'utils/form-helpers'

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
    repaymentsStrategy: {
      name: 'regular',
      startDate: new Date(),
      monthsBetweenRepayments: 3,
    },
  },
  expiryDate: getDateFromDateInput(request, 'expiryDate'),
  issuedEffectiveDate: getDateFromDateInput(request, 'issuedEffectiveDate'),
})

export default mapCreateFacilityFormToRequest
