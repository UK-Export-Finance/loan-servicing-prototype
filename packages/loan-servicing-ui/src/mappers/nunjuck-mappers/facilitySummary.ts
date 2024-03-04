import { FacilityDto } from 'loan-servicing-common'
import { placeholderToString } from 'strings/strategyNames'
import { GovUkSummaryListProps } from 'types/nunjucks'

// eslint-disable-next-line import/prefer-default-export
export const facilityToFacilitySummaryProps = (
  facility: FacilityDto,
): GovUkSummaryListProps => {
  const repayment = facility.facilityConfig.repaymentsStrategy
  return {
    rows: [
      {
        key: {
          text: 'Facility Type',
        },
        value: {
          text: facility.facilityType,
        },
      },
      {
        key: {
          text: 'Obligor ID',
        },
        value: {
          text: facility.obligor,
        },
      },
      {
        key: {
          text: 'Facility Max Principal',
        },
        value: {
          text: `£${facility.maxPrincipal}`,
        },
        actions: {
          items: [
            {
              href: `/facility/${facility.streamId}/adjustPrincipal`,
              text: 'Amend',
              visuallyHiddenText: 'facility amount',
            },
          ],
        },
      },
      {
        key: {
          text: 'Interest Strategy',
        },
        value: {
          text: placeholderToString(
            facility.facilityConfig.calculateInterestStrategy.name,
          ),
        },
      },
      {
        key: {
          text: 'Interest Rate',
        },
        value: {
          text: `${facility.interestRate}%`,
        },
        actions: {
          items: [
            {
              href: `/facility/${facility.streamId}/changeInterest`,
              text: 'Change',
              visuallyHiddenText: 'interest rate',
            },
          ],
        },
      },
      {
        key: {
          text: 'Start Date',
        },
        value: {
          text: new Date(facility.issuedEffectiveDate).toLocaleDateString(
            'en-GB',
          ),
        },
      },
      {
        key: {
          text: 'End Date',
        },
        value: {
          text: new Date(facility.expiryDate).toLocaleDateString('en-GB'),
        },
      },
      {
        key: {
          text: 'Repayments Strategy',
        },
        value: {
          html:
            repayment.name === 'Regular'
              ? `<b>${repayment.name}</b><br/>First payment: ${new Date(repayment.startDate).toLocaleDateString('en-GB')}<br/>Months between payments: ${repayment.monthsBetweenRepayments}`
              : `<b>${repayment.name}</b> - ${repayment.repayments.length} payments`,
        },
      },
    ],
  }
}