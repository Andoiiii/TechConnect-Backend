import express from "express";
import { Redis } from "ioredis";
import cors from "cors";
import bodyParser from "body-parser";

require('dotenv').config();

import { clubRouter } from "./routes/clubs";

const app = express();
export const redis = new Redis({
  port: process.env.REDIS_DB_PORT,
  host: `${process.env.REDIS_DB_HOST}`,
  password: `${process.env.REDIS_DB_PASSWORD}`,
});

app.use(bodyParser.json()).use(cors());

app.get("/", (req, res) => {
  res.send("Hello World! :3");
})


app.use("/api/clubs", clubRouter);

app.get("/factoryReset", (req, res) => {
  redis.flushall();
  redis.set("clubs:ID", 0);
  redis.set("hacks:ID", 0);
  res.send("Database Reset. Enjoy!");
})

app.get("/allKeys", (req, res) => {
  redis.keys("*").then((x) => res.send(x));
})

app.listen(
  process.env.PORT,
  () => console.log(`TechConnect Prototype listening on port ${process.env.PORT}!`) //confirmation of listening
);