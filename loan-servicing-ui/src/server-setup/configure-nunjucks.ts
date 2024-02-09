import nunjucks from "nunjucks";
import { NestExpressApplication } from "@nestjs/platform-express";

const configureNunjucks = (app: NestExpressApplication) => {
    const templatesDir = "src/templates"
    const express = app.getHttpAdapter().getInstance()
    app.setBaseViewsDir(templatesDir)
    app.setViewEngine('njk')

    const nunjucksEnv = nunjucks.configure(templatesDir, {
        express: express,
        autoescape: true,
        noCache: true,
    });
    
    nunjucksEnv.addGlobal("env", process.env.NODE_ENV);
};

export default configureNunjucks;
