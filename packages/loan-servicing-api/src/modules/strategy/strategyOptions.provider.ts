import { Provider } from '@nestjs/common'
import { REQUEST } from '@nestjs/core'
import {
  FacilityStrategyOptions,
  NewFacilityRequestDto,
} from 'loan-servicing-common'
import EventService from 'modules/event/event.service'
import { Request } from 'express'
import FacilityTypeEntity from 'models/entities/FacilityTypeEntity'
import { Repository } from 'typeorm/browser'
import { getRepositoryToken } from '@nestjs/typeorm'

const StrategyOptionsProvider = 'StrategyOptionsProvider'

export const strategyOptionsProviderConfig: Provider = {
  provide: StrategyOptionsProvider,
  inject: [REQUEST, EventService, getRepositoryToken(FacilityTypeEntity)],
  useFactory: async (
    request: Request,
    eventService: EventService,
    facilityTypeRepo: Repository<FacilityTypeEntity>,
  ): Promise<FacilityStrategyOptions> => {
    const streamId = (request.params as { id?: string }).id
    let facilityType: string
    if (streamId) {
      facilityType = await eventService.getFacilityTypeOfEventStream(streamId)
    } else {
      facilityType = (request.body as NewFacilityRequestDto).facilityType
    }

    const result = await facilityTypeRepo.findOne({
      where: { name: facilityType },
    })
    if (!result) {
      throw new Error(
        `No facility type definition found for type ${facilityType}`,
      )
    }

    return result
  },
}

export default StrategyOptionsProvider
