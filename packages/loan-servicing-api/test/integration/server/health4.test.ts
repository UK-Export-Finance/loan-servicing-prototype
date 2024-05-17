import request from 'supertest'

describe('should connect and return a query result', () => {
  it('can get system time', async () =>
    request(integrationTestApp.getHttpServer()).get('/server/date').expect(200))
})