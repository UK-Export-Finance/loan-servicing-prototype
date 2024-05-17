import SystemController from 'modules/system/system.controller'
import { Test } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import SystemValueEntity from 'models/SystemValueEntity'
import { Repository } from 'typeorm'
import { provideBlankMockRepositoryFor } from '../../../test/integration/utils/repository-mocks'
import SystemValueService from './systemValue.service'

describe('Server controller', () => {
  let serverController: SystemController
  let serverService: SystemValueService
  let systemValueRepo: Repository<SystemValueEntity>

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [SystemController],
      providers: [
        SystemValueService,
        provideBlankMockRepositoryFor(SystemValueEntity),
      ],
    }).compile()

    serverController = moduleRef.get(SystemController)
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
