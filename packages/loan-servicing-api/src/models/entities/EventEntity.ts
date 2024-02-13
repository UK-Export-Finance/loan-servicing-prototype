import Event from 'models/events'
import { UntypedEvent } from 'models/interfaces/event'
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
class EventEntity<T extends Event> implements UntypedEvent {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  streamId!: string

  @Column()
  streamVersion!: number

  @Column({ type: 'nvarchar' })
  type!: T['type']

  @Column({ type: 'int' })
  typeVersion!: T['typeVersion']

  @Column({ type: 'simple-json' })
  eventData!: T['eventData']
}

export default EventEntity
