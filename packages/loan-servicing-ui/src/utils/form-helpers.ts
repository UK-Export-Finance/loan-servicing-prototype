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

// P should be a union of the keys with type Date
export type MapDatesToDateFormInputs<
  Subject,
  P extends string & keyof Subject,
> = Omit<Subject, P> & DateInputFormData<P>

export const getDateFromDateInput = <P extends string>(
  formData: DateInputFormData<P>,
  dateInputName: P,
): Date => {
  const {
    [`${dateInputName}-day`]: day,
    [`${dateInputName}-month`]: month,
    [`${dateInputName}-year`]: year,
    // Use looser type as TS doesn't pick up the mapped type
  } = formData as { [t: string]: string }

  return new Date(Number(year), Number(month) - 1, Number(day))
}
