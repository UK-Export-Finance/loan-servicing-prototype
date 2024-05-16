afterAll(async () => {
  await Promise.all([
    global.integrationTestApp.close(),
    global.integrationTestDbContainer.stop(),
  ])
})
