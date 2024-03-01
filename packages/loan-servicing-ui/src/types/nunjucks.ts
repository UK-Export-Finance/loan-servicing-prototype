export type NunjuckTableRow = { text: string }[]

export type NunjuckSelectInputOption<T extends string> = {
  text: string
  value: T
}
