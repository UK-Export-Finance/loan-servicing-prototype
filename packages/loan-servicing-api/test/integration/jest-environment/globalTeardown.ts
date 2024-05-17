const globalTeardown = async () => {
  await global.integrationTestDbContainer.stop()
}

module.exports = globalTeardown
