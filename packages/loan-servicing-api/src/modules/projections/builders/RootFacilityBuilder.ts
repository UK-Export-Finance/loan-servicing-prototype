import {
  DeepReadonly,
  Drawing,
  Facility,
  Participation,
  ProjectedEvent,
  participationEventIdMappingndex,
  participationEventValueModificationIndex,
} from 'loan-servicing-common'
import { BadRequestException } from '@nestjs/common'
import Big from 'big.js'
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
          ...this.mapEventToParticipationEvent(e, p.facility),
          streamId: `${e.streamId}-participation-${p.facility.streamId}`,
        })),
      ),
    )
  }

  private mapEventToParticipationEvent = <T extends ProjectedEvent>(
    event: T,
    participation: DeepReadonly<InProgressParticipation>,
  ): T => {
    const e1 = this.adjustProRatedParticipationValues(
      event,
      participation.participantShare,
    )
    const e2 = this.mapEventId(e1, participation.streamId)
    return e2
  }

  private mapEventId = <T extends ProjectedEvent>(
    event: T,
    participationId: string,
  ): T => {
    const valuesToModify = (participationEventIdMappingndex[event.type] ??
      []) as (keyof T['eventData'])[]

    const modifiedValues = Object.fromEntries(
      valuesToModify.map((v) => [
        v,
        `${(event.eventData as T['eventData'])[v]}-participation-${participationId}`,
      ]),
    )

    return {
      ...event,
      eventData: {
        ...event.eventData,
        ...modifiedValues,
      },
    }
  }

  private adjustProRatedParticipationValues = <T extends ProjectedEvent>(
    event: T,
    participationShare: string,
  ): T => {
    const valuesToModify = (participationEventValueModificationIndex[
      event.type
    ] ?? []) as (keyof T['eventData'])[]

    const modifiedValues = Object.fromEntries(
      valuesToModify.map((v) => [
        v,
        Big((event.eventData as T['eventData'])[v] as string | number)
          .times(participationShare)
          .div(100)
          .toFixed(2),
      ]),
    )

    return {
      ...event,
      eventData: {
        ...event.eventData,
        ...modifiedValues,
      },
    }
  }
}

export default RootFacilityBuilder
