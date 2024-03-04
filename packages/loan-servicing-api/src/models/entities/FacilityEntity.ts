import { ClassAsJsonColumn, CurrencyColumn } from 'database/decorators'
import { Facility, FacilityConfiguration } from 'loan-servicing-common'
import { FacilityConfigurationDtoClass } from 'models/dtos/facilityConfiguration'
import { Column, Entity, PrimaryColumn } from 'typeorm'

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

  @Column()
  obligor!: string

  // @Column()
  // description!: string

  // @Column()
  // currency!: string

  @CurrencyColumn()
  outstandingPrincipal!: string

  @CurrencyColumn()
  maxPrincipal!: string

  @CurrencyColumn()
  interestAccrued: string = '0'

  @Column()
  interestRate!: string

  // @Column()
  // commitmentDate!: Date

  // @Column()
  // issuedNotEffectiveDate!: Date

  @Column()
  issuedEffectiveDate!: Date

  // @Column()
  // availabilityDate!: Date

  @Column()
  expiryDate!: Date

  // @Column()
  // usedAmount!: number

  // @Column()
  // availableAmount!: number
}

export default FacilityEntity
