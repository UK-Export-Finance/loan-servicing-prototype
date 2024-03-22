import { ApiProperty, OmitType } from '@nestjs/swagger'
import { IsArray, IsDate, IsNotEmpty, ValidateNested } from 'class-validator'
import {
  AddWithdrawalToDrawingDto,
  Drawing,
  DrawingAccrual,
  Facility,
  NewDrawingRequestDto,
  Repayment,
  RevertWithdrawlDto,
} from 'loan-servicing-common'
import { Transform, Type } from 'class-transformer'
import { DrawingConfigurationDtoClass } from './drawingConfiguration'
import { DrawingAccrualDtoClass } from './drawingAccrual'
import { DrawingRepaymentDto } from './drawingRepayment'

export class DrawingDtoClass implements Drawing {
  private readonly _type = 'DrawingDto'

  @ApiProperty()
  streamId!: string

  @ApiProperty()
  streamVersion!: number

  @ApiProperty()
  @Transform(({ value }) => ({ ...value, drawings: undefined }))
  facility!: Facility

  @ApiProperty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DrawingAccrualDtoClass)
  accruals!: DrawingAccrual[]

  @ApiProperty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DrawingRepaymentDto)
  repayments!: Repayment[]

  @ApiProperty()
  @IsNotEmpty()
  outstandingPrincipal!: string

  @ApiProperty()
  @IsNotEmpty()
  drawnAmount!: string

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  issuedEffectiveDate!: Date

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  currentDate!: Date

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  expiryDate!: Date
}

export class NewDrawingRequestDtoClass
  extends OmitType(DrawingDtoClass, [
    'streamVersion',
    'facility',
    'drawnAmount',
    'repayments',
    'currentDate',
  ])
  implements NewDrawingRequestDto
{
  facilityId!: string

  @ApiProperty()
  @ValidateNested()
  @Type(() => DrawingConfigurationDtoClass)
  drawingConfig!: DrawingConfigurationDtoClass
}

export class AddWithdrawalToDrawingDtoClass
  implements AddWithdrawalToDrawingDto
{
  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  date!: Date

  @ApiProperty()
  amount!: string
}

export class RevertWithdrawalDtoClass implements RevertWithdrawlDto {
  @ApiProperty()
  drawingStreamId!: string

  @ApiProperty()
  withdrawalEventStreamVersion!: number

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  dateOfWithdrawal!: Date
}
