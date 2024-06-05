import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsNotEmpty } from 'class-validator'
import { ParticipationProperties } from 'loan-servicing-common'
import {
  FacilityResponseDtoClass,
  NewFacilityRequestDtoClass,
} from './facility'

// eslint-disable-next-line import/prefer-default-export
export class NewParticipationRequestDto
  extends NewFacilityRequestDtoClass
  implements ParticipationProperties
{
  @ApiProperty()
  @Type(() => FacilityResponseDtoClass)
  @IsNotEmpty()
  parentFacilityId!: string

  @ApiProperty()
  participantShare!: string
}
