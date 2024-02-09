import express from "express";
import { tryGetApiData } from "../../api/base-client";

const initialRouter = express.Router();

initialRouter.get("/", async (req, res) => {
    const data = await tryGetApiData('');
    res.render("initial.njk", {
        apiData: JSON.stringify(data) || "Request failed :(",
    });
});

export default initialRouter