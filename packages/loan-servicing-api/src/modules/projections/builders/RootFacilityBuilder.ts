import {
  DeepReadonly,
  Drawing,
  Facility,
  Participation,
  ProjectedEvent,
} from 'loan-servicing-common'
import { BadRequestException } from '@nestjs/common'
import FacilityBuilder, {
  FacilityProjectionSnapshot,
  InProgressFacility,
  InProgressParticipation,
  InProgressRootFacility,
} from './FacilityBuilder'
import ParticipationFacilityBuilder from './ParticipationFacilityBuilder'

class RootFacilityBuilder extends FacilityBuilder {
  public participationBuilders: ParticipationFacilityBuilder[] = []

  constructor(
    protected readonly _facility: InProgressRootFacility,
    _unprocessedEvents: ProjectedEvent[],
    _projectionDate: Date,
  ) {
    super(_facility, _unprocessedEvents, _projectionDate)
  }

  public readonly facility: DeepReadonly<InProgressFacility> = this._facility

  public consumeInitialisationEvents(): ProjectedEvent[] {
    const participationCreationEvents = this._unprocessedEvents.filter(
      (e) =>
        e.type === 'CreateNewParticipation' ||
        e.type === 'AddParticipationToFacility',
    )
    this._unprocessedEvents = this._unprocessedEvents.filter(
      (e) =>
        e.type !== 'CreateNewParticipation' &&
        e.type !== 'AddParticipationToFacility',
    )
    this._processedEvents.push(...participationCreationEvents)
    return participationCreationEvents
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
      })) as Participation[],
    }
    facility.participations.forEach((p) => {
      // eslint-disable-next-line no-param-reassign
      p.parentFacility = facility
    })

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

  addParticipation(participation: InProgressParticipation): this {
    if (this.facility.hierarchyType !== 'root') {
      throw new BadRequestException(
        'Participations can only be added to root level facilities',
      )
    }
    this.participationBuilders.push(
      new ParticipationFacilityBuilder(participation, this.projectionDate),
    )
    return this
  }

  public passEventsToParticipations = (events: ProjectedEvent[]): void => {
    this.participationBuilders.forEach((p) =>
      p.addEvents(
        events.map((e) => ({
          ...e,
          streamId: `${e.streamId}-participation-${p.facility.streamId}`,
        })),
      ),
    )
  }
}

export default RootFacilityBuilder
