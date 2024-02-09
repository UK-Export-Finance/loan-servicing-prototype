import { Module } from "@nestjs/common";
import { getSqlDbDataSource } from "../database/data-source";
import { DataSource } from "typeorm";

@Module({
    providers: [
        {
            provide: "DatabaseConnection",
            useFactory: async (): Promise<DataSource> => {
                const SqlDbDataSource = getSqlDbDataSource();
                await SqlDbDataSource.initialize()
                    .then(() =>
                        console.info(
                            "🗄️ Successfully initialised connection to SQL database"
                        )
                    )
                    .catch((error) =>
                        console.error(
                            "❌ Failed to initialise connection to SQL database:",
                            error
                        )
                    );
                return SqlDbDataSource;
            },
        },
    ],
    exports: ["DatabaseConnection"],
})
export class DatabaseModule {}
