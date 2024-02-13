import { UntypedEvent } from 'models/interfaces/event'
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
class EventEntity<T extends object> implements UntypedEvent {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  streamId!: number

  @Column()
  streamVersion!: number

  @Column()
  type!: string

  @Column()
  typeVersion!: number

  @Column({ type: 'simple-json' })
  eventData!: T
}

export default EventEntity
