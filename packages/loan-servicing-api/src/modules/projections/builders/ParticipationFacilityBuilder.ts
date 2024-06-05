import { Drawing, ProjectedEvent } from 'loan-servicing-common'
import FacilityBuilder, {
  InProgressParticipation,
  ParticipationProjectionSnapshot,
} from './FacilityBuilder'

class ParticipationFacilityBuilder extends FacilityBuilder {
  constructor(
    protected readonly _facility: InProgressParticipation,
    _unprocessedEvents: ProjectedEvent[],
    _projectionDate: Date,
  ) {
    super(_facility, _unprocessedEvents, _projectionDate)
  }

  public takeSnapshot = (): ParticipationProjectionSnapshot => {
    const drawings = this.drawingBuilders.map((b) => b.build()) as Drawing[]

    const immutableSnapshot = structuredClone<ParticipationProjectionSnapshot>({
      participation: {
        ...this._facility,
        drawings,
      },
      transactions: this._transactions,
      processedEvents: this._processedEvents,
      unprocessedEvents: this._unprocessedEvents,
    })
    // immutableSnapshot.participation.drawings.forEach((d) => {
    //   // eslint-disable-next-line no-param-reassign
    //   d.facility = immutableSnapshot.participation
    // })
    return immutableSnapshot
  }
}

export default ParticipationFacilityBuilder
