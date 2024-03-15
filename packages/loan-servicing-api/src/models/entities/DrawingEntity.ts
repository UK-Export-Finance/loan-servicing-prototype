import {
  ArrayOfClassAsJsonColumn,
  ClassAsJsonColumn,
  CurrencyColumn,
} from 'database/decorators'
import {
  Drawing,
  DrawingAccrual,
  DrawingConfiguration,
} from 'loan-servicing-common'
import { DrawingConfigurationDtoClass } from 'models/dtos/drawingConfiguration'
import { Column, Entity, ManyToOne, PrimaryColumn, Relation } from 'typeorm'
import { DrawingAccrualDtoClass } from 'models/dtos/drawingAccrual'
import type FacilityEntity from './FacilityEntity'

@Entity()
class DrawingEntity implements Drawing {
  @PrimaryColumn()
  streamId!: string

  @Column()
  streamVersion!: number

  @ManyToOne('FacilityEntity', 'drawings')
  facility!: Relation<FacilityEntity>

  @ArrayOfClassAsJsonColumn(DrawingAccrualDtoClass)
  accruals!: DrawingAccrual[]

  @ClassAsJsonColumn(DrawingConfigurationDtoClass)
  drawingConfig!: DrawingConfiguration

  @CurrencyColumn()
  outstandingPrincipal!: string

  @Column()
  issuedEffectiveDate!: Date

  @Column()
  expiryDate!: Date
}

export default DrawingEntity
