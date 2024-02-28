import {
  CalculateInterestStrategyName,
  FacilityType,
} from 'loan-servicing-common'
import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm'

@Entity()
@Unique('unique_type_name', ['name'])
class FacilityTypeEntity implements FacilityType {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  name!: string

  @Column({type: 'simple-array'})
  interestStrategies!: CalculateInterestStrategyName[]
}

export default FacilityTypeEntity
