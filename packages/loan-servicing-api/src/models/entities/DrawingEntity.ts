import { ArrayOfClassAsJsonColumn, CurrencyColumn } from 'database/decorators'
import {
  Drawing,
  DrawingAccrual,
  Facility,
  Participation,
  Repayment,
} from 'loan-servicing-common'
import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm'
import { DrawingAccrualDtoClass } from 'models/dtos/drawingAccrual'
import { DrawingRepaymentDto } from 'models/dtos/drawingRepayment'
import FacilityEntity from './FacilityEntity'

@Entity()
class DrawingEntity implements Drawing {
  @PrimaryColumn()
  streamId!: string

  @Column()
  streamVersion!: number

  @ManyToOne(() => FacilityEntity, (e) => e.drawings)
  facility!: Facility | Participation

  @ArrayOfClassAsJsonColumn(DrawingAccrualDtoClass)
  accruals!: DrawingAccrual[]

  @ArrayOfClassAsJsonColumn(DrawingRepaymentDto)
  repayments!: Repayment[]

  @CurrencyColumn()
  outstandingPrincipal!: string

  @CurrencyColumn()
  drawnAmount!: string

  @Column()
  issuedEffectiveDate!: Date

  @Column()
  expiryDate!: Date

  @Column()
  currentDate!: Date
}

export default DrawingEntity
