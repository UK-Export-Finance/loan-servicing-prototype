import dotenv from "dotenv";
import express from "express";
import setupLiveReload from "./server/livereload";
import configureNunjucks from "./server/configure-nunjucks";
import setupRoutes from "./server/routes";

dotenv.config();

if (process.env.NODE_ENV === "development") {
    setupLiveReload();
}

const app = express();
const port = process.env.PORT;

configureNunjucks(app)

setupRoutes(app)

app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
