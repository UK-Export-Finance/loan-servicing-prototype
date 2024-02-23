import { Facility } from 'loan-servicing-common'
import { Column, Entity, PrimaryColumn } from 'typeorm'

@Entity()
class FacilityEntity implements Facility {
  @PrimaryColumn()
  streamId!: string

  @Column()
  streamVersion!: number

  @Column()
  obligor!: string

  // @Column()
  // facilityType!: string

  // @Column()
  // description!: string

  // @Column()
  // currency!: string

  @Column()
  facilityAmount!: string

  @Column()
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
