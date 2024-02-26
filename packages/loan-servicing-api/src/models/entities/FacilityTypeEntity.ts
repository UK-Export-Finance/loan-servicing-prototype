import { CalculateInterestStrategyName, FacilityType } from 'loan-servicing-common'
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
class FacilityTypeEntity implements FacilityType {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  name!: string

  @Column()
  calculateInterestStrategy!: CalculateInterestStrategyName
}

export default FacilityTypeEntity
