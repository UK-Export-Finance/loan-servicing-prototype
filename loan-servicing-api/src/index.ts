import dotenv from "dotenv";
import express from "express";
import { SqlDbDataSource } from "./database/data-source";
import User from "./entity/User";

dotenv.config();

const app = express();
const port = process.env.PORT;

SqlDbDataSource.initialize()
    .then(() =>
        console.info("🗄️ Successfully initialised connection to SQL database")
    )
    .catch((error) =>
        console.error(
            "❌ Failed to initialise connection to SQL database:",
            error
        )
    );

app.get("/", async (req, res) => {
    const user = new User();
    user.name = "user-name";
    const userRepo = SqlDbDataSource.getRepository(User);
    const result = await userRepo.save(user);
    res.send(result);
});

app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
