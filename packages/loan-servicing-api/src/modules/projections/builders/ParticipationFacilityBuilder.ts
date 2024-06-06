import { DeepReadonly, Drawing } from 'loan-servicing-common'
import FacilityBuilder, {
  InProgressParticipation,
  ParticipationProjectionSnapshot,
} from './FacilityBuilder'

class ParticipationFacilityBuilder extends FacilityBuilder {
  constructor(
    protected readonly _facility: InProgressParticipation,
    _projectionDate: Date,
  ) {
    super(_facility, [], _projectionDate)
  }

  public readonly facility: DeepReadonly<InProgressParticipation> =
    this._facility

  public participationBuilders = null

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
    immutableSnapshot.participation.drawings.forEach((d) => {
      // eslint-disable-next-line no-param-reassign
      d.facility = immutableSnapshot.participation
    })
    return immutableSnapshot
  }

  public passEventsToParticipations = (): void => {}
}

export default ParticipationFacilityBuilder
