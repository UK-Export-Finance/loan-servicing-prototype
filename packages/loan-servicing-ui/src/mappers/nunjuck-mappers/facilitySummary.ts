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
            href: `/facility/${facility.streamId}/drawing/new/start?facilityType=${facility.facilityType}`,
            text: 'Create new drawing',
          },
        ],
      },
    },
  ],
})

export const facilityToDrawingSummaries = (
  facility: Facility,
): GovUkSummaryListProps[] =>
  facility.drawings.map((drawing) => ({
    card: {
      title: {
        text: `Drawing ${drawing.streamId}`,
      },
      actions: {
        items: [
          {
            href: `/facility/${facility.streamId}/drawing/${drawing.streamId}`,
            text: 'View',
          },
        ],
      },
    },
    rows: [
      {
        key: {
          text: 'Amount Drawn',
        },
        value: {
          text: drawing.outstandingPrincipal,
        },
      },
      {
        key: {
          text: 'Expiry Date',
        },
        value: {
          text: new Date(drawing.expiryDate).toLocaleDateString('en-GB'),
        },
      },
    ],
  }))
