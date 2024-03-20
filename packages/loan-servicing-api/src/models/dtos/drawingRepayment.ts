import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsDate } from 'class-validator'
import { Repayment } from 'loan-servicing-common'

// eslint-disable-next-line import/prefer-default-export
export class DrawingRepaymentDto implements Repayment {
  @ApiProperty()
  id!: string

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  date!: Date

  @ApiProperty()
  amount!: string

  @ApiProperty()
  received!: boolean
}
