import axios from 'axios'

// eslint-disable-next-line import/prefer-default-export
export const tryGetApiData = async <T extends object>(
  route: string,
): Promise<T | null> => {
  try {
    const response = await axios.get(`${process.env.API_URL}/${route}`)
    return response.data as T
  } catch {
    return null
  }
}
