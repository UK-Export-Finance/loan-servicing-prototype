describe('should connect and return a query result', () => {
  it('can get system time', async () => request.get('/system/date').expect(200))
})
