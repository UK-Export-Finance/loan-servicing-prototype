import {
  Drawing,
  Facility,
  ProjectedEvent,
  Transaction,
  sortEventByEffectiveDate,
} from 'loan-servicing-common'

class FacilityProjection {
  transactions: Transaction[] = []

  facility: Facility

  constructor(
    initialEntity: Facility,
    private projectionEvents: ProjectedEvent[],
  ) {
    this.facility = initialEntity
  }

  addEvents(newEvents: ProjectedEvent[]): ProjectedEvent[] {
    this.projectionEvents = [...this.projectionEvents, ...newEvents].sort(
      sortEventByEffectiveDate,
    )
    return this.projectionEvents
  }

  consumeNextEvent = (): ProjectedEvent | undefined =>
    this.projectionEvents.shift()

  peekNextEvent = (): ProjectedEvent => this.projectionEvents[0]

  getRemainingEvents = (): ProjectedEvent[] => [...this.projectionEvents]

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
