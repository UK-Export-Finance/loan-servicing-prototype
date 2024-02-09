import nunjucks from "nunjucks";
import { Express } from "express";

const configureNunjucks = (app: Express) => {
    const nunjucksEnv = nunjucks.configure("src/templates", {
        express: app,
        autoescape: true,
        watch: true,
        noCache: true,
    });
    
    nunjucksEnv.addGlobal("env", process.env.NODE_ENV);
};

export default configureNunjucks;
