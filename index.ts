import express from "express";
import cors from "cors";
import { config } from "dotenv";
import cookieParser from "cookie-parser";
import { router } from "./router";
import { errorMiddleware } from "./middlewares/error-midleware";
import path from "path";

config();

const PORT = process.env.PORT || 7000;
const app = express();

const uploadsPath = path.resolve(process.cwd(), "uploads");

console.log("Ищу картинки по пути:", uploadsPath);

// Кэшируем статику на 7 дней (в миллисекундах)
app.use(
  "/uploads",
  express.static(uploadsPath, {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    etag: true,
  }),
);

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
