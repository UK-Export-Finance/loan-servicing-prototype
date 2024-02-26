import { Provider } from '@nestjs/common'
import { REQUEST } from '@nestjs/core'
import {
  FacilityStrategyOptions,
  NewFacilityRequestDto,
} from 'loan-servicing-common'
import EventService from 'modules/event/event.service'
import { Request } from 'express'
import FacilityTypeService from './facilityType.service'

const StrategyOptionsProvider = 'StrategyOptionsProvider'

export const strategyOptionsProviderConfig: Provider = {
  provide: StrategyOptionsProvider,
  inject: [REQUEST, EventService, FacilityTypeService],
  useFactory: async (
    request: Request,
    eventService: EventService,
    facilityTypeService: FacilityTypeService,
  ): Promise<FacilityStrategyOptions> => {
    const streamId = (request.params as { id?: string }).id
    if (streamId) {
      const facilityType =
        await eventService.getFacilityTypeOfEventStream(streamId)
      return facilityTypeService.getPropertiesOfFacilityType(facilityType)
    }
    const { facilityType } = request.body as NewFacilityRequestDto
    return facilityTypeService.getPropertiesOfFacilityType(facilityType)
  },
}

export default StrategyOptionsProvider
