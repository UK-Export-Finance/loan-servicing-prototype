import { Injectable } from '@nestjs/common'
import { UserResponseDto } from 'loan-servicing-common'
import { tryGetApiData } from '../api/base-client'

@Injectable()
class UserService {
  async getUser() {
    const data = await tryGetApiData<UserResponseDto>('')
    return JSON.stringify(data) || 'Request failed :('
  }
}

export default UserService
