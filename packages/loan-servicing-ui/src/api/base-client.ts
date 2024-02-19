import axios from 'axios'

export const getApiUrl = (route: string): string => `${process.env.API_URL}/${route}`

export const tryGetApiData = async <T extends object>(
  route: string,
): Promise<T | null> => {
  try {
    const response = await axios.get(getApiUrl(route))
    return response.data as T
  } catch {
    return null
  }
}

export const postApiData = async <T extends object>(
  route: string,
  body: object,
): Promise<T | null> => {
  try {
    const response = await axios.post(getApiUrl(route), body)
    return response.data
  } catch {
    return null
  }
}
