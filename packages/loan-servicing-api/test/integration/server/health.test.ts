import SystemValueEntity from 'models/SystemValueEntity'

describe('should connect and return a query result', () => {
  it('can get system time', async () => {
    const testDate = new Date(2024, 1, 1)

    const systemDate = testDb.manager.create(SystemValueEntity, {
      name: 'SYSTEM_DATE',
      value: testDate.toISOString(),
    })
    await testDb.manager.save(systemDate)
    await request.get('/system/date').expect(200).expect(testDate.toISOString())
  })
})
