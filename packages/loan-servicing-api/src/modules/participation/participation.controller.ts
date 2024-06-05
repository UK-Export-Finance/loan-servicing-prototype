import { Body, Controller, Param, Post, Query } from '@nestjs/common'
import { ApiTags, ApiParam, ApiOkResponse } from '@nestjs/swagger'
import EventService from 'modules/event/event.service'
import { FacilityResponseDtoClass } from 'models/dtos/facility'
import { plainToInstance } from 'class-transformer'
import { NewParticipationRequestDtoClass } from 'models/dtos/participation'
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
    @Body() body: NewParticipationRequestDtoClass,
    @Param('facilityId') facilityId: string,
    @Query('facilityVersion') facilityVersion: number,
  ): Promise<FacilityResponseDtoClass> {
    const facilityWithNewParticipation =
      await this.participationService.createNewParticipation(
        body,
        facilityId,
        facilityVersion,
      )

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
