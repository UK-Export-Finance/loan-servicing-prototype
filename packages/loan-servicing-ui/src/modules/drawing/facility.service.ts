// import { Injectable } from '@nestjs/common'
// import { postApiData, tryGetApiData } from 'api/base-client'
// import {
//   LoanServicingEvent,
//   NewFacilityRequestDto,
//   DrawingDto,
//   AdjustFacilityAmountDto,
//   DrawingTransaction,
//   Facility,
// } from 'loan-servicing-common'
// import getEventTableRow, { getTransactionTableRow } from 'mappers/nunjuck-mappers/eventTable'
// import { NunjuckTableRow } from 'types/nunjucks'
// import { buildNunjucksTableRow } from 'utils/nunjucks-parsers'

// @Injectable()
// class FacilityService {
//   async createFacility(
//     facility: NewFacilityRequestDto,
//   ): Promise<DrawingDto | null> {
//     const newFacility = await postApiData<DrawingDto>('facility/new', facility)
//     return newFacility
//   }

//   async adjustPrincipal(
//     streamId: string,
//     streamVersion: string,
//     adjustment: AdjustFacilityAmountDto,
//   ): Promise<void> {
//     await postApiData(
//       `facility/${streamId}/adjustPrincipal?version=${streamVersion}`,
//       adjustment,
//     )
//   }

//   async getFacility(streamId: string): Promise<Facility | null> {
//     const facility = await tryGetApiData<Facility>(`facility/${streamId}`)
//     return facility
//   }

//   async getFacilityEventTableRows(
//     streamId: string,
//   ): Promise<NunjuckTableRow[] | null> {
//     const events = await tryGetApiData<LoanServicingEvent[]>(
//       `facility/${streamId}/events`,
//     )
//     return (
//       events
//         ?.map(getEventTableRow)
//         .map((e) =>
//           buildNunjucksTableRow(e, [
//             'eventDate',
//             'event',
//             'description',
//             'effectiveDate',
//           ]),
//         ) || null
//     )
//   }

//   async getFacilityTransactionRows(
//     streamId: string,
//   ): Promise<NunjuckTableRow[] | null> {
//     const transactions = await tryGetApiData<DrawingTransaction[]>(
//       `facility/${streamId}/transactions?interestResolution=monthly`,
//     )
//     return (
//       transactions
//         ?.map(getTransactionTableRow)
//         .map((e) =>
//           buildNunjucksTableRow(e, [
//             'date',
//             'reference',
//             'transactionAmount',
//             'balance',
//             'interestAccrued',
//           ]),
//         ) || null
//     )
//   }
// }

// export default FacilityService
