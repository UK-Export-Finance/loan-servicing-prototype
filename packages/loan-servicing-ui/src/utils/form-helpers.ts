import { BadRequestException } from '@nestjs/common'

type BaseDateInputFormData = {
  '-day': string
  '-month': string
  '-year': string
}

export type MandatoryDateInputFormData<P extends string> = {
  [K in keyof BaseDateInputFormData as K extends string
    ? `${P}${K}`
    : never]: string
}

export type OptionalDateFormInput<P extends string> = Partial<
  MandatoryDateInputFormData<P>
>

export const getDateFromDateInput = <P extends string>(
  formData: OptionalDateFormInput<P>,
  dateInputName: P,
): Date => {
  const {
    [`${dateInputName}-day`]: day,
    [`${dateInputName}-month`]: month,
    [`${dateInputName}-year`]: year,
    // Use looser type as TS doesn't pick up the mapped type
  } = formData as { [t: string]: string }

  if (day && month && year) {
    return new Date(Number(year), Number(month) - 1, Number(day))
  }

  throw new BadRequestException(
    `Date input ${dateInputName} is missing a value`,
  )
}
