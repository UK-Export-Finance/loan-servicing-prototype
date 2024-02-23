import { Injectable, Provider } from '@nestjs/common'
import { REQUEST } from '@nestjs/core'
import {
  FacilityStrategyOptions,
  NewFacilityRequestDto,
} from 'loan-servicing-common'
import EventService from 'modules/event/event.service'
import { Request } from 'express'
import { InjectRepository } from '@nestjs/typeorm'
import FacilityTypeEntity from 'models/entities/FacilityType'
import { Repository } from 'typeorm'

const StrategyOptionsProvider = 'StrategyOptionsProvider'

@Injectable()
export class StrategyOptionsService {
  constructor(
    @InjectRepository(FacilityTypeEntity)
    private facilityTypeRepo: Repository<FacilityTypeEntity>,
  ) {}
}

export const strategyOptionsProviderConfig: Provider = {
  provide: StrategyOptionsProvider,
  inject: [REQUEST, EventService],
  useFactory: async (
    request: Request,
    eventService: EventService,
  ): Promise<FacilityStrategyOptions> => {
    const streamId = (request.params as { id?: string }).id
    if (streamId) {
      const facilityType =
        await eventService.getFacilityTypeOfEventStream(streamId)
      return facilityType === 'default'
        ? { calculateInterestStrategy: 'PrincipalOnly' }
        : { calculateInterestStrategy: 'Compounding' }
    }
    const { facilityType } = request.body as NewFacilityRequestDto
    return facilityType === 'default'
      ? { calculateInterestStrategy: 'PrincipalOnly' }
      : { calculateInterestStrategy: 'Compounding' }
  },
}

export default StrategyOptionsProvider
