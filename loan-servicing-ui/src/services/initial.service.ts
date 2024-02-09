import { Injectable } from '@nestjs/common'
import { tryGetApiData } from '../api/base-client'
import { UserResponseDto } from 'loan-servicing-common'

@Injectable()
export class InitialService {
  async getUser() {
    const data = await tryGetApiData<UserResponseDto>('')
    return JSON.stringify(data) || 'Request failed :('
  }
}
