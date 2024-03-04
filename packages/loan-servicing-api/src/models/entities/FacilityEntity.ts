import {
  ArrayOfClassAsJsonColumn,
  CurrencyColumn,
} from 'database/decorators'
import { Facility } from 'loan-servicing-common'
import { DrawingDtoClass } from 'models/dtos/drawing'
import { Column, Entity, PrimaryColumn } from 'typeorm'

@Entity()
class FacilityEntity implements Facility {
  @PrimaryColumn()
  streamId!: string

  @Column()
  streamVersion!: number

  @Column()
  facilityType!: string

  @ArrayOfClassAsJsonColumn(DrawingDtoClass)
  drawings!: DrawingDtoClass[]

  @Column()
  obligor!: string

  @CurrencyColumn()
  facilityAmount!: string

  @Column()
  issuedEffectiveDate!: Date

  @Column()
  expiryDate!: Date
}

export default FacilityEntity
