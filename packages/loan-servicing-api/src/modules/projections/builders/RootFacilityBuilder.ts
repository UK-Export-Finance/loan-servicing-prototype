import {
  Drawing,
  Facility,
  Participation,
  ProjectedEvent,
} from 'loan-servicing-common'
import { BadRequestException } from '@nestjs/common'
import FacilityBuilder, {
  FacilityProjectionSnapshot,
  InProgressRootFacility,
} from './FacilityBuilder'
import ParticipationFacilityBuilder from './ParticipationFacilityBuilder'

class RootFacilityBuilder extends FacilityBuilder {
  private participationBuilders: ParticipationFacilityBuilder[] = []

  constructor(
    protected readonly _facility: InProgressRootFacility,
    _unprocessedEvents: ProjectedEvent[],
    _projectionDate: Date,
  ) {
    super(_facility, _unprocessedEvents, _projectionDate)
  }

  takeSnapshot = (): FacilityProjectionSnapshot => {
    const drawings = this.drawingBuilders.map((b) => b.build()) as Drawing[]
    const participationSnapshots = this.participationBuilders.map((b) =>
      b.takeSnapshot(),
    )
    const facility: Facility = {
      ...this._facility,
      drawings,
      participations: participationSnapshots.map((p) => ({
        ...p.participation,
        parentFacility: facility,
      })),
    }

    const immutableSnapshot = structuredClone<FacilityProjectionSnapshot>({
      rootFacility: facility,
      transactions: this._transactions,
      processedEvents: this._processedEvents,
      unprocessedEvents: this._unprocessedEvents,
      participationSnapshots: participationSnapshots.map((s) => ({
        ...s,
        participation: { ...s.participation, parentFacility: facility },
      })),
    })

    immutableSnapshot.rootFacility.drawings.forEach((d) => {
      // eslint-disable-next-line no-param-reassign
      d.facility = immutableSnapshot.rootFacility
    })
    immutableSnapshot.participationSnapshots.forEach((p) =>
      p.participation.drawings.forEach((d) => {
        // eslint-disable-next-line no-param-reassign
        d.facility = p.participation
      }),
    )
    return immutableSnapshot
  }

  addParticipation(
    participationProperties: Omit<Participation, 'drawings'>,
  ): this {
    if (this.facility.hierarchyType !== 'root') {
      throw new BadRequestException(
        'Participations can only be added to root level facilities',
      )
    }
    this.participationBuilders.push(
      new ParticipationFacilityBuilder(
        {
          ...this.facility,
          facilityFees: [],
          participantShare: participationProperties.participantShare,
          participation: [],
          participationsConfig: [],
        },
        this._unprocessedEvents.filter(
          (e) => e.type !== 'CreateNewParticipation',
        ),
        this.projectionDate,
      ),
    )
    return this
  }
}

export default RootFacilityBuilder
