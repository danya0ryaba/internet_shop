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

async function getUsers() {
  const existingCategory = await prisma.category.findUnique({
    where: { name: "Название категории" },
  });
  if (!existingCategory) {
    const lala = await prisma.category.create({
      data: { name: "Название категории" },
    });
    console.log("Категория не существует и она создается и = " + lala);
  } else {
    console.log("Категория существует и = " + existingCategory.id);
  }
}

app.listen(PORT, () => {
  console.log(`Server started on PORT = ${PORT}`);
  getUsers();
});
