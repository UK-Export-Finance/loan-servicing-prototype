import {
  CalculateInterestStrategyName,
  FacilityFeeStrategyName,
  FacilityType,
  RepaymentStrategyName,
} from 'loan-servicing-common'
import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm'

@Entity()
@Unique('unique_type_name', ['name'])
class FacilityTypeEntity implements FacilityType {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  name!: string

  @Column({ type: 'simple-array' })
  interestStrategies!: CalculateInterestStrategyName[]

  @Column({ type: 'simple-array' })
  repaymentsStrategies!: RepaymentStrategyName[]

  @Column({ type: 'simple-array' })
  facilityFeeStrategies!: FacilityFeeStrategyName[]
}

export default FacilityTypeEntity
