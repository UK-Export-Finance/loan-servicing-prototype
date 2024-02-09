import initialRouter from "./initial-router";
import { Express } from "express";

const setupRoutes = (app: Express) => {
    app.use(initialRouter);
};

export default setupRoutes;
