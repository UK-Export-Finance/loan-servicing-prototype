import { Event } from 'loan-servicing-common'
import { UntypedEvent } from 'models/dtos/event'
import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm'

@Entity()
@Unique('versionOfStream' , ['streamId', 'streamVersion'])
class EventEntity<T extends Event> implements UntypedEvent  {
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
