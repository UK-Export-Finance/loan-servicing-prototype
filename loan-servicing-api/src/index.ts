import dotenv from "dotenv";
import express from "express";
import 'reflect-metadata';

dotenv.config();

const app = express();
const port = process.env.PORT;

app.get("/", (req, res) => {
    res.send("I have come from the API!!");
});

app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
