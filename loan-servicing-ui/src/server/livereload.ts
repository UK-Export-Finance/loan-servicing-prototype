const setupLiveReload = () => {
    const livereload = require("livereload");

    const liveReloadServer = livereload.createServer({
        port: 35729,
        extraExts: ["njk"],
    });

    liveReloadServer.server.once("connection", () => {
        setTimeout(() => {
            liveReloadServer.refresh("/");
        }, 100);
    });
}

export default setupLiveReload