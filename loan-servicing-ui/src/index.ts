import axios from "axios";
import dotenv from "dotenv";
import express from "express";
import nunjucks from "nunjucks";

dotenv.config();

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

app.get("/", async (req, res) => {
    const data = await getApiData();
    res.render("initial.njk", { apiData: data || "Request failed" });
});

app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
