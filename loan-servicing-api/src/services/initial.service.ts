import { Inject, Injectable } from "@nestjs/common";
import User from "../entity/User";
import { DataSource } from "typeorm";

@Injectable()
export class InitialService {
    constructor(@Inject("DatabaseConnection") private database: DataSource) {}

    async getUser() {
        const user = new User();
        user.name = "user-name";
        const userRepo = this.database.getRepository(User);
        const result = await userRepo.save(user);
        return result;
    }
}
