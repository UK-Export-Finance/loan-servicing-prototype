import { NotFoundException } from '@nestjs/common'
import {
  DeepReadonly,
  DrawingEvent,
  Facility,
  FacilityFee,
  NonNestedValues,
  Participation,
  ProjectedEvent,
  Transaction,
  sortEventByEffectiveDate,
} from 'loan-servicing-common'
import DrawingEntity from 'models/entities/DrawingEntity'
import { DrawingBuilder } from './DrawingBuilder'
import type ParticipationFacilityBuilder from './ParticipationFacilityBuilder'

export type InProgressRootFacility = Omit<
  Facility,
  'drawings' | 'participations'
>

export type InProgressParticipation = Omit<
  Participation,
  'drawings' | 'parentFacility'
> & { parentFacilityId: string }

export type InProgressFacility =
  | InProgressRootFacility
  | InProgressParticipation

export type ReadonlyInProgressFacility = DeepReadonly<
  | Omit<Facility, 'drawings' | 'participations'>
  | Omit<Participation, 'drawings' | 'parentFacility'>
>

export type ParticipationProjectionSnapshot = {
  participation: Omit<Participation, 'parentFacility'>
  transactions: Transaction[]
  processedEvents: ProjectedEvent[]
  unprocessedEvents: ProjectedEvent[]
}

export type FacilityProjectionSnapshot = {
  rootFacility: Facility
  participationSnapshots: {
    participation: Participation
    transactions: Transaction[]
    processedEvents: ProjectedEvent[]
    unprocessedEvents: ProjectedEvent[]
  }[]
  transactions: Transaction[]
  processedEvents: ProjectedEvent[]
  unprocessedEvents: ProjectedEvent[]
}

abstract class FacilityBuilder {
  protected _transactions: Transaction[] = []

  protected drawingBuilders: DrawingBuilder[] = []

  protected _processedEvents: ProjectedEvent[] = []

  protected facilityFees: FacilityFee[] = []

  constructor(
    protected readonly _facility: InProgressFacility,
    protected _unprocessedEvents: ProjectedEvent[],
    protected _projectionDate: Date,
  ) {}

  public abstract readonly facility: ReadonlyInProgressFacility

  public readonly transactions: DeepReadonly<Transaction[]> = this._transactions

  public readonly processedEvents: DeepReadonly<ProjectedEvent[]> =
    this._processedEvents

  public readonly unprocessedEvents: DeepReadonly<ProjectedEvent[]> =
    this._unprocessedEvents

  public readonly projectionDate = this._projectionDate

  public abstract participationBuilders: ParticipationFacilityBuilder[] | null

  public abstract passEventsToParticipations: (events: ProjectedEvent[]) => void

  public abstract takeSnapshot: () =>
    | FacilityProjectionSnapshot
    | ParticipationProjectionSnapshot

  addDrawing(drawing: DrawingEntity, drawingEvents: DrawingEvent[]): this {
    this.drawingBuilders.push(new DrawingBuilder(drawing))
    this.addEvents(drawingEvents)
    return this
  }

  addEvents(newEvents: ProjectedEvent[]): ProjectedEvent[] {
    this._unprocessedEvents = [...this._unprocessedEvents, ...newEvents].sort(
      sortEventByEffectiveDate,
    )
    return this._unprocessedEvents
  }

  addFacilityFee(fee: FacilityFee): this {
    this.facilityFees.push(fee)
    return this
  }

  getFacilityFee(id: string): FacilityFee {
    const fee = this.facilityFees.find((a) => a.id === id)!
    return fee
  }

  updateFacilityFeeValue = (id: string, value: string): this => {
    const fee = this.facilityFees.find((a) => a.id === id)!
    fee.balance = value
    return this
  }

  addTransactions(newTransactions: Transaction[] | Transaction): this {
    if (Array.isArray(newTransactions)) {
      this._transactions.push(...newTransactions)
    } else {
      this._transactions.push(newTransactions)
    }
    return this
  }

  consumeNextEvent = (): ProjectedEvent | undefined => {
    const [event] = this._unprocessedEvents
    if (event) {
      this._unprocessedEvents.shift()
      this._processedEvents.push(event)
    }
    return event
  }

  consumeNextCompletedEvent = (): ProjectedEvent | undefined => {
    const [event] = this._unprocessedEvents
    if (event) {
      if (event.effectiveDate > this._projectionDate) {
        const nextProcessableFutureEvent = this._unprocessedEvents.find(
          (e) => e.shouldProcessIfFuture,
        )
        if (!nextProcessableFutureEvent) {
          return undefined
        }
        this._unprocessedEvents = this._unprocessedEvents.filter(
          (e) => e !== nextProcessableFutureEvent,
        )
        this._processedEvents.push(nextProcessableFutureEvent)
        return nextProcessableFutureEvent
      }
      this._unprocessedEvents.shift()
      this._processedEvents.push(event)
    }
    return event
  }

  peekNextEvent = (): ProjectedEvent => this._unprocessedEvents[0]

  updateFacilityValues = (
    updates: Partial<NonNestedValues<Facility>>,
  ): this => {
    Object.assign(this._facility, updates)
    return this
  }

  getDrawingBuilder = (id: string): DrawingBuilder => {
    const drawing = this.drawingBuilders.find((d) => d.id === id)
    if (!drawing) {
      throw new NotFoundException('drawing not found in projection')
    }
    return drawing
  }

  getTransactionByStreamVersion = (version: number): Transaction => {
    const transaction = this._transactions.find(
      (t) => t.sourceEvent?.streamVersion === version,
    )
    if (!transaction) {
      throw new NotFoundException(
        `Transaction not found for at stream version ${version}`,
      )
    }
    return transaction
  }
}

export default FacilityBuilder
