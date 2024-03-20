import {
  Drawing,
  Facility,
  ProjectedEvent,
  Repayment,
  Transaction,
  sortEventByEffectiveDate,
} from 'loan-servicing-common'

class FacilityProjection {
  transactions: Transaction[] = []

  facility: Facility

  processedEvents: ProjectedEvent[] = []

  repayments: Repayment[] = []

  constructor(
    initialEntity: Facility,
    private unprocessedEvents: ProjectedEvent[],
    private projectionDate: Date,
  ) {
    this.facility = initialEntity
  }

  addEvents(newEvents: ProjectedEvent[]): ProjectedEvent[] {
    this.unprocessedEvents = [...this.unprocessedEvents, ...newEvents].sort(
      sortEventByEffectiveDate,
    )
    return this.unprocessedEvents
  }

  consumeNextEvent = (): ProjectedEvent | undefined => {
    const [event] = this.unprocessedEvents
    if (event) {
      if (event.effectiveDate > this.projectionDate) {
        const nextProcessableFutureEvent = this.unprocessedEvents.find(
          (e) => e.shouldProcessIfFuture,
        )
        if (!nextProcessableFutureEvent) {
          return undefined
        }
        this.unprocessedEvents = this.unprocessedEvents.filter(
          (e) => e !== nextProcessableFutureEvent,
        )
        this.processedEvents.push(nextProcessableFutureEvent)
        return nextProcessableFutureEvent
      }
      this.unprocessedEvents.shift()
      this.processedEvents.push(event)
    }
    return event
  }

  peekNextEvent = (): ProjectedEvent => this.unprocessedEvents[0]

  getRemainingEvents = (): ProjectedEvent[] => [...this.unprocessedEvents]

  setDrawingProperty = <T extends keyof Drawing>(
    drawingId: string,
    propertyName: T,
    value: Drawing[T],
  ): void => {
    const drawing = this.getDrawing(drawingId)
    drawing[propertyName] = value
  }

  getDrawing = (id: string): Drawing => {
    const drawing = this.facility.drawings.find((d) => d.streamId === id)
    if (!drawing) {
      throw new Error('drawing not found in projection')
    }
    return drawing
  }
}

export default FacilityProjection
