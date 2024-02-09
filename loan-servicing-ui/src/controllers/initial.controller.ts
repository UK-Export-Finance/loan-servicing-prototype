import { Controller, Get, Render } from "@nestjs/common";
import { tryGetApiData } from "../api/base-client";
import { InitialService } from "../services/initial.service";

@Controller("")
export class InitialController {
    constructor(private initialService: InitialService) {}

    @Get()
    @Render("initial")
    async findAll() {
        const apiData = await this.initialService.getUser()
        return {
            apiData,
        };
    }
}
