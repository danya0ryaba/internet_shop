import express from "express";
import { config } from "dotenv";
import { prisma } from "./lib/prisma";

config();

const PORT = process.env.PORT || 7000;
const app = express();

const start = async () => {
  try {
    app.listen(PORT, () => {
      console.log("start, on PORT = " + PORT);
    });
    const user = await prisma.user.findMany();
    console.log("Created user:", user);
  } catch (error: any) {
    console.log(error.message);
  }
};

start();
