import {
  ClassAsJsonColumn,
  CurrencyColumn,
} from 'database/decorators'
import { Facility, FacilityConfiguration } from 'loan-servicing-common'
import { Column, Entity, OneToMany, PrimaryColumn, Relation } from 'typeorm'
import { FacilityConfigurationDtoClass } from 'models/dtos/facilityConfiguration'
import type DrawingEntity from './DrawingEntity'

@Entity()
class FacilityEntity implements Facility {
  @PrimaryColumn()
  streamId!: string

  @Column()
  streamVersion!: number

  @Column()
  facilityType!: string

  @ClassAsJsonColumn(FacilityConfigurationDtoClass)
  facilityConfig!: FacilityConfiguration

  @OneToMany('DrawingEntity', 'facility', { cascade: true, eager: true })
  drawings!: Relation<DrawingEntity>[]

  @Column()
  obligor!: string

  @CurrencyColumn()
  facilityAmount!: string

  @CurrencyColumn()
  drawnAmount!: string

  @CurrencyColumn()
  undrawnAmount!: string

  @CurrencyColumn()
  facilityFeeBalance!: string

  @Column()
  issuedEffectiveDate!: Date

  @Column()
  expiryDate!: Date
}

export default FacilityEntity
