import { ApiProperty, PartialType } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'
import {
  NewFacilityRequestDto,
  UpdateFacilityRequestDto,
} from 'loan-servicing-common'

export class NewFacilityRequestDtoClass implements NewFacilityRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  obligor!: string

  @ApiProperty()
  @IsNotEmpty()
  facilityAmount!: number
}

export class UpdateFacilityRequestDtoClass
  extends PartialType(NewFacilityRequestDtoClass)
  implements UpdateFacilityRequestDto {}
