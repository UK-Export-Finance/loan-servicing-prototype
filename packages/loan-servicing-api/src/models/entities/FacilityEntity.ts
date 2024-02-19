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

  @Column({ default: 1 })
  facilityAmount!: number

  @Column('decimal', { default: 2.3, precision: 8, scale: 6 })
  interestRate!: number

  // @Column()
  // commitmentDate!: Date

  // @Column()
  // issuedNotEffectiveDate!: Date

  // @Column()
  // issuedEffectiveDate!: Date

  // @Column()
  // availabilityDate!: Date

  // @Column()
  // expiryDate!: Date

  // @Column()
  // usedAmount!: number

  // @Column()
  // availableAmount!: number
}

export default FacilityEntity
