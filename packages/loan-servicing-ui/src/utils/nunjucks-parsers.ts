import { PropertiesWithType } from 'loan-servicing-common'
import { NunjuckTableRow } from 'types/nunjucks'

// eslint-disable-next-line import/prefer-default-export
export const buildNunjucksTableRow = <T extends { [s: string]: any }>(
  object: T,
  tableColumns: PropertiesWithType<T, string>[],
): NunjuckTableRow => tableColumns.map((k) => ({ text: object[k] }))
