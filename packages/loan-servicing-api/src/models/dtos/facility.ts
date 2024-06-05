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
  Drawing,
  FacilityFee,
  FacilityHierarchy,
  FacilityResponseDto,
  NewFacilityRequestDto,
} from 'loan-servicing-common'
import { Transform, Type } from 'class-transformer'
import { DrawingDtoClass } from './drawing'
import {
  FacilityFeeDtoClass,
  ParticpationPropertiesDtoClass,
} from './facilityConfiguration'

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
  @IsNotEmpty()
  hierarchyType!: FacilityHierarchy

  @ApiProperty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FacilityResponseDtoClass)
  participations!: FacilityResponseDtoClass[]

  @ApiProperty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FacilityResponseDtoClass)
  participationsConfig!: ParticpationPropertiesDtoClass[]

  @ApiProperty()
  @Type(() => FacilityResponseDtoClass)
  parentFacility?: FacilityResponseDto

  @ApiProperty({ type: () => [FacilityFeeDtoClass] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FacilityFeeDtoClass)
  facilityFees!: FacilityFee[]

  @ApiProperty()
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
  @IsDate()
  @Type(() => Date)
  issuedEffectiveDate!: Date

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  expiryDate!: Date

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  currentDate!: Date
}

export class NewFacilityRequestDtoClass
  extends OmitType(FacilityResponseDtoClass, [
    'streamId',
    'streamVersion',
    'drawings',
    'drawnAmount',
    'undrawnAmount',
    'facilityFees',
    'currentDate',
    'parentFacility',
    'participations',
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

export class FacilityListFilters {
  @ApiProperty({ required: false })
  isActive?: boolean
}
