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

app.get("/", (req, res) => {
    res.render("initial.njk");
});

app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
