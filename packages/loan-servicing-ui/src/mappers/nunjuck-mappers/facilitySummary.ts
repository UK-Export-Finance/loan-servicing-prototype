import { Facility } from 'loan-servicing-common'
import { GovUkSummaryListProps } from 'types/nunjucks'

// eslint-disable-next-line import/prefer-default-export
export const facilityToFacilitySummaryProps = (
  facility: Facility,
): GovUkSummaryListProps => ({
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
          text: 'Facility Amount',
        },
        value: {
          text: `£${facility.facilityAmount}`,
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
          text: 'Drawings',
        },
        value: {
          text: 'blah',
        },
        actions: {
          items: [
            {
              href: `/facility/${facility.streamId}/drawing`,
              text: 'Add',
              visuallyHiddenText: 'new drawing',
            },
          ],
        },
      },
    ],
  })
