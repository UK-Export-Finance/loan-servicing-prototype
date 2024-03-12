import { Injectable } from '@nestjs/common'
import { postApiData, tryGetApiData } from 'api/base-client'
import {
  LoanServicingEvent,
  NewFacilityRequestDto,
  DrawingDto,
  AdjustFacilityAmountDto,
  Transaction,
  Facility,
  AddFixedFacilityFeeDto,
  AddAccruingFacilityFeeDto,
} from 'loan-servicing-common'

@Injectable()
class FacilityService {
  async createFacility(
    facility: NewFacilityRequestDto,
  ): Promise<DrawingDto | null> {
    const newFacility = await postApiData<DrawingDto>('facility/new', facility)
    return newFacility
  }

  async adjustPrincipal(
    streamId: string,
    streamVersion: string,
    adjustment: AdjustFacilityAmountDto,
  ): Promise<void> {
    await postApiData(
      `facility/${streamId}/adjustPrincipal?version=${streamVersion}`,
      adjustment,
    )
  }

  async getFacility(streamId: string): Promise<Facility | null> {
    const facility = await tryGetApiData<Facility>(`facility/${streamId}`)
    return facility
  }

  async getFacilityEventTableRows(
    streamId: string,
  ): Promise<LoanServicingEvent[] | null> {
    const events = await tryGetApiData<LoanServicingEvent[]>(
      `facility/${streamId}/events`,
    )
    return events
  }

  async getFacilityTransactionRows(
    streamId: string,
  ): Promise<Transaction[] | null> {
    const transactions = await tryGetApiData<Transaction[]>(
      `facility/${streamId}/transactions?resolution=monthly`,
    )
    return transactions
  }

  async addFixedFacilityFee(
    streamId: string,
    streamVersion: string,
    dto: AddFixedFacilityFeeDto,
  ): Promise<void> {
    await postApiData(
      `facility/${streamId}/addFacilityFee/fixed?version=${streamVersion}`,
      dto,
    )
  }

  async addAccruingFacilityFee(
    streamId: string,
    streamVersion: string,
    dto: AddAccruingFacilityFeeDto,
  ): Promise<void> {
    await postApiData(
      `facility/${streamId}/addFacilityFee/accruing?version=${streamVersion}`,
      dto,
    )
  }
}

export default FacilityService
