import { NotFoundException } from '@nestjs/common'
import {
  DeepReadonly,
  Drawing,
  DrawingEvent,
  Facility,
  FacilityFee,
  NonNestedValues,
  ProjectedEvent,
  Transaction,
  sortEventByEffectiveDate,
} from 'loan-servicing-common'
import DrawingEntity from 'models/entities/DrawingEntity'
import { deepCopy } from './builerUtils'
import { DrawingBuilder } from './DrawingBuilder'

export type InProgressFacility = DeepReadonly<Omit<Facility, 'drawings'>>

export type FacilityProjectionSnapshot = {
  facility: Facility
  transactions: Transaction[]
  processedEvents: ProjectedEvent[]
  unprocessedEvents: ProjectedEvent[]
}

class FacilityBuilder {
  private _transactions: Transaction[] = []

  private drawingBuilders: DrawingBuilder[] = []

  private _processedEvents: ProjectedEvent[] = []

  private facilityFees: FacilityFee[] = []

  constructor(
    private readonly _facility: Omit<Facility, 'drawings'>,
    private _unprocessedEvents: ProjectedEvent[],
    private _projectionDate: Date,
  ) {}

  public readonly facility: InProgressFacility = this._facility

  public readonly transactions: DeepReadonly<Transaction[]> = this._transactions

  public readonly processedEvents: DeepReadonly<ProjectedEvent[]> =
    this._processedEvents

  public readonly unprocessedEvents: DeepReadonly<ProjectedEvent[]> =
    this._unprocessedEvents

  public readonly projectionDate = this._projectionDate

  takeSnapshot = (): FacilityProjectionSnapshot => {
    const drawings = this.drawingBuilders.map((b) => b.build()) as Drawing[]
    const facility: Facility = {
      ...this._facility,
      drawings,
    }
    const immutableSnapshot = deepCopy({
      facility,
      transactions: this._transactions,
      processedEvents: this._processedEvents,
      unprocessedEvents: this._unprocessedEvents,
    })
    immutableSnapshot.facility.drawings.forEach((d) => {
      // eslint-disable-next-line no-param-reassign
      d.facility = immutableSnapshot.facility
    })
    return immutableSnapshot
  }

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
      throw new Error('drawing not found in projection')
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
