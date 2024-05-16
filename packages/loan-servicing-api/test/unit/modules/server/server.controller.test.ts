import ServerController from "modules/server/server.controller"

test('Health check endpoint returns expected response', () => {
  const serverController = new ServerController()

  expect(serverController.getFacility()).toEqual('LS Healthy')
})
