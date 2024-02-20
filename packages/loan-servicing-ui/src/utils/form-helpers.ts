type BaseDateInputFormData = {
  '-day': string
  '-month': string
  '-year': string
}

export type DateInputFormData<P extends string> = {
  [K in keyof BaseDateInputFormData as K extends string
    ? `${P}${K}`
    : never]: string
}

export type MapDatesToDateFormInputs<Subject, P extends string> = Omit<
  Subject,
  P
> &
  DateInputFormData<P>

// eslint-disable-next-line import/prefer-default-export
export const getDateFromDateInput = <P extends string>(
  formData: DateInputFormData<P>,
  dateInputName: P,
): Date => {
  const {
    [`${dateInputName}-day`]: day,
    [`${dateInputName}-month`]: month,
    [`${dateInputName}-year`]: year,
    // Use any as TS doesn't pick up the mapped type
  } = formData as { [t: string]: string }

  return new Date(Number(year), Number(month) - 1, Number(day))
}
