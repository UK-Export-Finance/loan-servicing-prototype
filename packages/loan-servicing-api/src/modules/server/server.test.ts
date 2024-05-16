import ServerController from 'modules/server/server.controller'
import { Test } from '@nestjs/testing'

describe('Server controller', () => {
  let serverController: ServerController

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [ServerController],
    }).compile()

    serverController = moduleRef.get(ServerController)
  })

  it('Health check endpoint returns expected response', () => {
    expect(serverController.getHealth()).toEqual('LS Healthy')
  })
})
