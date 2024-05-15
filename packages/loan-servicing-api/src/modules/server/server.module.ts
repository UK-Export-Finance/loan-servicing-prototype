import { Module } from "@nestjs/common";
import ServerController from "./server.controller";

@Module({controllers:[ServerController
    
]})
class ServerModule {}

export default ServerModule