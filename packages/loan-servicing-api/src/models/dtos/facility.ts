import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'
import {
  Facility,
  NewFacilityRequestDto,
  UpdateFacilityRequestDto,
} from 'loan-servicing-common'

export class FacilityResponseDtoClass implements Facility {
  @ApiProperty()
  streamId!: string

  @ApiProperty()
  streamVersion!: number

  @ApiProperty()
  @IsNotEmpty()
  obligor!: string

  @ApiProperty()
  @IsNotEmpty()
  facilityAmount!: number
}

export class NewFacilityRequestDtoClass
  extends OmitType(FacilityResponseDtoClass, ['streamId', 'streamVersion'])
  implements NewFacilityRequestDto {}

export class UpdateFacilityRequestDtoClass
  extends PartialType(NewFacilityRequestDtoClass)
  implements UpdateFacilityRequestDto {}
