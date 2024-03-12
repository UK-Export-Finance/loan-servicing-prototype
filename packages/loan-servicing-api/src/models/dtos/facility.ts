import { ApiProperty, OmitType } from '@nestjs/swagger'
import {
  ArrayNotEmpty,
  IsArray,
  IsDate,
  IsNotEmpty,
  ValidateNested,
} from 'class-validator'
import {
  AdjustFacilityAmountDto,
  BalancesLookup,
  Drawing,
  FacilityResponseDto,
  NewFacilityRequestDto,
} from 'loan-servicing-common'
import { Transform, Type } from 'class-transformer'
import { DrawingDtoClass } from './drawing'
import { FacilityConfigurationDtoClass } from './facilityConfiguration'

export class FacilityResponseDtoClass implements FacilityResponseDto {
  private readonly _type = 'FacilityDto'

  @ApiProperty()
  streamId!: string

  @ApiProperty()
  streamVersion!: number

  @ApiProperty()
  @IsNotEmpty()
  facilityType!: string

  @ApiProperty()
  @ValidateNested()
  @Type(() => FacilityConfigurationDtoClass)
  facilityConfig!: FacilityConfigurationDtoClass

  @ApiProperty({ type: () => [DrawingDtoClass] })
  @ArrayNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DrawingDtoClass)
  @IsNotEmpty()
  @Transform(({ value }) =>
    value.map((d: Drawing) => ({ ...d, facility: undefined })),
  )
  drawings!: Drawing[]

  @ApiProperty()
  @IsNotEmpty()
  obligor!: string

  @ApiProperty()
  @IsNotEmpty()
  facilityAmount!: string

  @ApiProperty()
  @IsNotEmpty()
  drawnAmount!: string

  @ApiProperty()
  @IsNotEmpty()
  undrawnAmount!: string

  @ApiProperty()
  @IsNotEmpty()
  @IsArray()
  facilityFeeBalances!: BalancesLookup

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
    'drawings',
    'drawnAmount',
    'undrawnAmount',
    'facilityFeeBalances',
    'facilityConfig'
  ])
  implements NewFacilityRequestDto {}

export class AdjustFacilityAmountDtoClass implements AdjustFacilityAmountDto {
  @ApiProperty()
  effectiveDate!: string

  @ApiProperty()
  adjustment!: string
}

export class AddDrawingToFacilityClass {
  @ApiProperty()
  drawingId!: string
}
