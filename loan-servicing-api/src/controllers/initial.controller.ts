import { Controller, Get, Render } from "@nestjs/common";
import { InitialService as UserService } from "../services/initial.service";

@Controller("")
export class InitialController {
    constructor(private userService: UserService) {}

    @Get()
    async getUser() {
        const result = this.userService.getUser()
        return result;
    }
}
