import { Column, Entity, PrimaryColumn } from 'typeorm'

@Entity()
class SystemValueEntity {
  @PrimaryColumn()
  name!: string

  @Column()
  value!: string
}

export default SystemValueEntity
