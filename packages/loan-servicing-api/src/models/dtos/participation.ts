import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsNotEmpty } from 'class-validator'
import {
  NewParticipationRequestDto,
  ParticipationProperties,
} from 'loan-servicing-common'
import {
  FacilityResponseDtoClass,
  NewFacilityRequestDtoClass,
} from './facility'

export class NewParticipationRequestDtoClass
  extends NewFacilityRequestDtoClass
  implements NewParticipationRequestDto
{
  @ApiProperty()
  @Type(() => FacilityResponseDtoClass)
  @IsNotEmpty()
  parentFacilityId!: string

  @ApiProperty()
  participantShare!: string
}

export class ParticipationPropertiesDtoClass
  implements ParticipationProperties
{
  @ApiProperty()
  @Type(() => FacilityResponseDtoClass)
  @IsNotEmpty()
  parentFacilityId!: string

  @ApiProperty()
  participationFacilityId!: string

  @ApiProperty()
  participantShare!: string
}
