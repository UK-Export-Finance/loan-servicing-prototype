import { Controller, Get } from "@nestjs/common";
import { InitialService as UserService } from "../services/initial.service";
import { UserResponseDto } from "loan-servicing-common";

@Controller("")
export class InitialController {
    constructor(private userService: UserService) {}

    @Get()
    async getUser(): Promise<UserResponseDto> {
        const { name, id } = await this.userService.getUser();
        return {
            name,
            id: id.toString(),
        };
    }
}
