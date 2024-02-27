import { CurrencyColumn } from 'database/decorators'
import { Facility } from 'loan-servicing-common'
import { Column, Entity, PrimaryColumn } from 'typeorm'

@Entity()
class FacilityEntity implements Facility {
  @PrimaryColumn()
  streamId!: string

  @Column()
  streamVersion!: number

  @Column()
  facilityType!: string

  @Column()
  obligor!: string

  // @Column()
  // description!: string

  // @Column()
  // currency!: string

  @CurrencyColumn()
  facilityAmount!: string

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
