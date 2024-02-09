import { Module } from "@nestjs/common";
import { InitialModule } from "./initial.module";

@Module({
    imports: [InitialModule],
    
})
export class AppModule {}
