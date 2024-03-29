import { LoanServicingEvent } from '../interfaces/events'
import { PropertiesWithType } from './type-utils'

type HasEffectiveDate = Pick<LoanServicingEvent, 'effectiveDate'>

export const sortByDateOnKey =
  <T extends object>(key: PropertiesWithType<T, Date>) =>
  (a: T, b: T): number =>
    (a[key] as Date).getTime() - (b[key] as Date).getTime()

// eslint-disable-next-line import/prefer-default-export
export const sortEventByEffectiveDate =
  sortByDateOnKey<HasEffectiveDate>('effectiveDate')
