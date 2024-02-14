import { Injectable } from '@nestjs/common'
import { tryGetApiData } from 'api/base-client'

@Injectable()
class UserService {
  async getUser() {
    const data = await tryGetApiData('')
    return JSON.stringify(data) || 'Request failed :('
  }
}

export default UserService
