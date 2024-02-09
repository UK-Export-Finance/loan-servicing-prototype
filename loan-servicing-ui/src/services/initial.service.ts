import { Injectable } from "@nestjs/common";
import { tryGetApiData } from "../api/base-client";

@Injectable()
export class InitialService {
    async getUser() {
        const data = await tryGetApiData("");
        return JSON.stringify(data) || "Request failed :(";
    }
}
