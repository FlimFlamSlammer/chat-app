import dotenv from "dotenv";

dotenv.config();

export const ENV = {
    PORT: parseInt(process.env.PORT || "5000"),
    SOCKET_PORT: parseInt(process.env.SOCKET_PORT || "5001"),
    MONGO_URI: process.env.MONGO_URI as string,
    JWT_SECRET: process.env.JWT_SECRET as string,
    APP_URL: process.env.APP_URL as string,
};
