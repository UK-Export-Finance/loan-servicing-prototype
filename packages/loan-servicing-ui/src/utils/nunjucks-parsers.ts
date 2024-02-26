import { PropertiesWithType } from 'loan-servicing-common'

export type NunjucksTableRow = { text: string }[]

export const buildNunjucksTableRow = <T extends { [s: string]: any }>(
  object: T,
  tableColumns: PropertiesWithType<T, string>[],
): NunjucksTableRow => tableColumns.map((k) => ({ text: object[k] }))
