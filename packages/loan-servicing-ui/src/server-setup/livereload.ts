const setupLiveReload = (): void => {
  // eslint-disable-next-line import/no-extraneous-dependencies, global-require
  const livereload = require('livereload')

  const liveReloadServer = livereload.createServer({
    port: 35729,
    extraExts: ['njk'],
  })

  liveReloadServer.server.once('connection', () => {
    setTimeout(() => {
      liveReloadServer.refresh('/')
    }, 100)
  })
}

export default setupLiveReload
