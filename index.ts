import express from "express";
import cors from "cors";
import { config } from "dotenv";
import cookieParser from "cookie-parser";
import { router } from "./router";
import { errorMiddleware } from "./middlewares/error-midleware";
import { prisma } from "./lib/prisma";

config();

const PORT = process.env.PORT || 7000;
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    credentials: true, // разрешает обмениваться куками
    origin: process.env.CLIENT_URL,
  }),
);

app.use("/api", router);

app.use(errorMiddleware);

async function users() {
  const users = await prisma.product.findMany();
  console.log(users);
}

// [
//   {
//     id: 2,
//     name: 'Овощи',
//     createdAt: 2026-03-27T06:44:34.904Z,
//     updatedAt: 2026-03-27T06:44:34.904Z
//   },
//   {
//     id: 3,
//     name: 'Цветы',
//     createdAt: 2026-03-27T06:44:34.904Z,
//     updatedAt: 2026-03-27T06:44:34.904Z
//   },
//   {
//     id: 4,
//     name: 'Зелень и травы',
//     createdAt: 2026-03-27T06:44:34.904Z,
//     updatedAt: 2026-03-27T06:44:34.904Z
//   },
//   {
//     id: 5,
//     name: 'Грибы',
//     createdAt: 2026-03-27T06:44:34.904Z,
//     updatedAt: 2026-03-27T06:44:34.904Z
//   },
//   {
//     id: 6,
//     name: 'Ягоды',
//     createdAt: 2026-03-27T06:44:34.904Z,
//     updatedAt: 2026-03-27T06:44:34.904Z
//   },
//   {
//     id: 7,
//     name: 'Другое',
//     createdAt: 2026-03-27T06:44:34.904Z,
//     updatedAt: 2026-03-27T06:44:34.904Z
//   }
// ]

app.listen(PORT, () => {
  console.log(`Server started on PORT = ${PORT}`);
  users();
});
