import { ApiProperty, OmitType } from '@nestjs/swagger'
import {
  ArrayNotEmpty,
  IsArray,
  IsDate,
  IsNotEmpty,
  ValidateNested,
} from 'class-validator'
import {
  AddWithdrawalToDrawingDto,
  AdjustFacilityAmountDto,
  Drawing,
  FacilityResponseDto,
  NewFacilityRequestDto,
} from 'loan-servicing-common'
import { Type } from 'class-transformer'
import { DrawingDtoClass } from './drawing'

export class FacilityResponseDtoClass implements FacilityResponseDto {
  @ApiProperty()
  streamId!: string

  @ApiProperty()
  streamVersion!: number

  @ApiProperty()
  @IsNotEmpty()
  facilityType!: string

  @ApiProperty({ type: () => [DrawingDtoClass] })
  @ArrayNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DrawingDtoClass)
  @IsNotEmpty()
  drawings!: Drawing[]

  @ApiProperty()
  @IsNotEmpty()
  obligor!: string

  @ApiProperty()
  @IsNotEmpty()
  facilityAmount!: string

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  issuedEffectiveDate!: Date

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  expiryDate!: Date
}

export class NewFacilityRequestDtoClass
  extends OmitType(FacilityResponseDtoClass, [
    'streamId',
    'streamVersion',
    'drawings'
  ])
  implements NewFacilityRequestDto {}

export class AdjustFacilityAmountDtoClass
  implements AdjustFacilityAmountDto
{
  @ApiProperty()
  effectiveDate!: string

  @ApiProperty()
  adjustment!: string
}

export class AddDrawingDtoClass implements AddWithdrawalToDrawingDto {
  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  date!: Date

  @ApiProperty()
  amount!: string
}
