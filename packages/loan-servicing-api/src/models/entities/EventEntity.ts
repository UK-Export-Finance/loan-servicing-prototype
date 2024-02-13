import Event from 'models/events'
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
class EventEntity<T extends Event> {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  streamId!: number

  @Column()
  streamVersion!: number

  @Column()
  type!: T['type']

  @Column()
  typeVersion!: T['typeVersion']

  @Column({ type: 'simple-json' })
  eventData!: T['eventData']
}

export default EventEntity
