import ServerController from 'modules/server/server.controller'
import { Test } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import SystemValueEntity from 'models/SystemValueEntity'
import { Repository } from 'typeorm'
import { provideBlankMockRepositoryFor } from 'utils/unit-test/repository-mocks'
import SystemValueService from './systemValue.service'

describe('Server controller', () => {
  let serverController: ServerController
  let serverService: SystemValueService
  let systemValueRepo: Repository<SystemValueEntity>

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [ServerController],
      providers: [
        SystemValueService,
        provideBlankMockRepositoryFor(SystemValueEntity),
      ],
    }).compile()

    serverController = moduleRef.get(ServerController)
    serverService = moduleRef.get(SystemValueService)
    systemValueRepo = moduleRef.get(getRepositoryToken(SystemValueEntity))
  })

  it('Health check endpoint returns expected response', () => {
    expect(serverController.getHealth()).toEqual('LS Healthy')
  })

  it('System date service fetches expected value', async () => {
    const testDate = new Date(2024, 1, 1)

    jest.spyOn(systemValueRepo, 'findOneByOrFail').mockResolvedValueOnce({
      name: 'SYSTEM_DATE',
      value: testDate.toISOString(),
    })
    
    const serviceValue = await serverService.getSystemDate()
    expect(serviceValue).toEqual(testDate)
  })
})
