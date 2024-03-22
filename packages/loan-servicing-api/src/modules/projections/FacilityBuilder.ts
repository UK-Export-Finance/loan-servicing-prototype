import { NotFoundException } from '@nestjs/common'
import {
  DeepReadonly,
  Drawing,
  DrawingAccrual,
  DrawingEvent,
  Facility,
  FacilityFee,
  NonNestedValues,
  ProjectedEvent,
  Repayment,
  Transaction,
  sortEventByEffectiveDate,
} from 'loan-servicing-common'
import DrawingEntity from 'models/entities/DrawingEntity'

const deepCopy = <T>(x: T): T => {
  // JSON to string
  const to = (_: string, v: any): string => {
    // Serialise date with timezone
    if (v && v instanceof Date) {
      return v.toUTCString()
    }

    return v
  }

  // String to JSON
  const from = (_: string, v: any): any => {
    // Restore date
    if (
      v &&
      typeof v === 'string' &&
      v.indexOf('Z') > -1 &&
      !Number.isNaN(new Date(v))
    ) {
      return new Date(v)
    }

    return v
  }

  return JSON.parse(JSON.stringify(x, to), from) as T
}

export type InProgressDrawing = DeepReadonly<
  Omit<Drawing, 'facility' | 'accruals' | 'repayments'>
>

class DrawingBuilder {
  private accruals: DrawingAccrual[] = []

  private repayments: Repayment[] = []

  constructor(
    private readonly _drawing: Omit<
      Drawing,
      'facility' | 'accruals' | 'repayments'
    >,
  ) {}

  public readonly id = this._drawing.streamId

  public readonly drawing: InProgressDrawing = this._drawing

  build = (): Omit<Drawing, 'facility'> =>
    deepCopy({
      ...this._drawing,
      accruals: this.accruals,
      repayments: this.repayments,
    })

  getAccrual = (id: string): Readonly<DrawingAccrual> => {
    const accrual = this.accruals.find((a) => a.id === id)!
    return accrual
  }

  addAccruals(newAccruals: DrawingAccrual[] | DrawingAccrual): this {
    if (Array.isArray(newAccruals)) {
      this.accruals.push(...newAccruals)
    } else {
      this.accruals.push(newAccruals)
    }
    return this
  }

  setRepayments(repayments: Repayment[]): this {
    this.repayments = repayments
    return this
  }

  getRepayment = (id: string): DeepReadonly<Repayment> =>
    this.getMutableRepayment(id)

  private getMutableRepayment(id: string): Repayment {
    const repayment = this.repayments.find((r) => r.id === id)
    if (!repayment) {
      throw new Error(`repayment with id ${id} was not found`)
    }
    return repayment
  }

  updateRepaymentValue(
    id: string,
    update: Partial<NonNestedValues<Repayment>>,
  ): this {
    const repayment = this.getMutableRepayment(id)
    Object.assign(repayment, update)
    return this
  }

  updateAccrualValue = (id: string, value: string): this => {
    const accrual = this.accruals.find((a) => a.id === id)!
    accrual.currentValue = value
    return this
  }

  updateDrawingValues = (updates: Partial<NonNestedValues<Drawing>>): this => {
    Object.assign(this._drawing, updates)
    return this
  }
}

export type InProgressFacility = DeepReadonly<Omit<Facility, 'drawings'>>

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

  build = (): Facility => {
    const drawings = this.drawingBuilders.map((b) => b.build()) as Drawing[]
    const facility: Facility = {
      ...deepCopy(this._facility),
      drawings,
    }
    facility.drawings.forEach((d) => {
      // eslint-disable-next-line no-param-reassign
      d.facility = facility
    })
    return facility
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
