import { Body, Controller, Param, Post } from '@nestjs/common'
import { ApiTags, ApiParam, ApiOkResponse } from '@nestjs/swagger'
import EventService from 'modules/event/event.service'
import {
  FacilityResponseDtoClass,
  NewFacilityRequestDtoClass,
} from 'models/dtos/facility'
import { plainToInstance } from 'class-transformer'
import ParticipationService from './participation.service'

@ApiTags('Participation')
@Controller('/facility/:facilityId/participation')
@ApiParam({ name: 'facilityId', required: true, type: 'string' })
class ParticipationController {
  constructor(
    private participationService: ParticipationService,
    private eventService: EventService,
  ) {}

  @Post('')
  @ApiOkResponse({ type: FacilityResponseDtoClass })
  async addParticipation(
    @Body() body: NewFacilityRequestDtoClass,
    @Param('facilityId') facilityId: string,
  ): Promise<FacilityResponseDtoClass> {
    const facilityWithNewParticipation =
      await this.participationService.createNewParticipation(body, facilityId)

    return plainToInstance(
      FacilityResponseDtoClass,
      facilityWithNewParticipation,
      {
        enableCircularCheck: true,
      },
    )
  }
}

export default ParticipationController
