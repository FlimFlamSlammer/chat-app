import express from "express";
import { ENV } from "./env";
import { errorMiddleware } from "./error";
import mongoose from "mongoose";

async function startServer() {
    const app = express();
    const PORT = ENV.PORT;

    mongoose.connect(ENV.MONGO_URI).then(() => console.log("Connected!"));

    app.use(errorMiddleware);

    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}

startServer().then();
