import express from "express";
import cors from "cors";
import { config } from "dotenv";
import cookieParser from "cookie-parser";
import { router } from "./router";
import { errorMiddleware } from "./middlewares/error-midleware";
import { prisma } from "./lib/prisma";
import { OrderStatus } from "./generated/prisma/enums";

config();

const PORT = process.env.PORT || 7000;
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: process.env.CLIENT_URL,
  }),
);

app.use("/api", router);

app.use(errorMiddleware);

// переписать category Зелень и травы чтобы было без пробелов
app.listen(PORT, () => {
  console.log(`Server started on PORT = ${PORT}`);
});
