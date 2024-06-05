import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsNotEmpty } from 'class-validator'
import {
  FacilityResponseDtoClass,
  NewFacilityRequestDtoClass,
} from './facility'

// eslint-disable-next-line import/prefer-default-export
export class NewParticipationRequestDto extends NewFacilityRequestDtoClass {
  @ApiProperty()
  @Type(() => FacilityResponseDtoClass)
  @IsNotEmpty()
  parentFacility!: FacilityResponseDtoClass
}
