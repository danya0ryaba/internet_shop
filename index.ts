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
    credentials: true, // разрешает обмениваться куками
    origin: process.env.CLIENT_URL,
  }),
);

app.use("/api", router);

app.use(errorMiddleware);

async function users() {
  const users = await prisma.category.findMany();
  console.log(users);
}
async function createOrder() {
  try {
    const torederUser = await prisma.order.create({
      data: {
        token: "123",
        totalAmount: 1500,
        status: OrderStatus.PENDING,
        paymentId: "12",
        items: [],
        fullName: "String",
        email: "String",
        phone: "String",
        address: "String",
        comment: "String",
      },
    });
    console.log(torederUser);
  } catch (error) {
    console.log("словил маслину");
  }
}
// переписать category Зелень и травы чтобы было без пробелов
app.listen(PORT, () => {
  console.log(`Server started on PORT = ${PORT}`);
});
