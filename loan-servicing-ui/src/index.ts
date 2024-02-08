import axios from "axios";
import dotenv from "dotenv";
import express from "express";
import nunjucks from "nunjucks";
import livereload from "livereload";

dotenv.config();

const liveReloadServer = livereload.createServer({
    port: 35729,
    extraExts: ["njk"],
});

liveReloadServer.server.once("connection", () => {
    setTimeout(() => {
        liveReloadServer.refresh("/");
    }, 100);
});

const app = express();
const port = process.env.PORT;

nunjucks.configure("src/templates", {
    express: app,
    autoescape: true,
    watch: true,
    noCache: true,
});

const getApiData = async () => {
    try {
        const response = await axios.get(process.env.API_URL!);
        return response.data;
    } catch {
        return null;
    }
};

const router = express.Router();

router.get("/", async (req, res) => {
    const data = await getApiData();
    res.render("initial.njk", { apiData: "k" || data || "Request failed :(" });
});

app.use(router);

app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
