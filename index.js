import express from "express";
import { Redis } from "ioredis";
require('dotenv').config();
import cors from "cors";
import bodyParser from "body-parser";

import { clubRouter } from "./routes/clubs";


const app = express();
const redis = new Redis({
  port: process.env.REDIS_DB_PORT,
  host: `${process.env.REDIS_DB_HOST}`,
  password: `${process.env.REDIS_DB_PASSWORD}`,
});

let test = 0;

app.use(bodyParser.json()).use(cors());


app.get("/", (req, res) => {
  res.send("Hello World! :3");
})

app.post("/:test", (req, res) => {
  const key = req.params.test;
  redis.set(key, test);
  res.json({ Key: key, val: test});
  ++test;
})

app.get("/get/:ind", (req, res) => {
  const ind = req.params.ind;
  redis.get(ind, (err, result) => {
    if (err || result == null) {
      res.status(500).json({ ...err, "Status" : "Oh no. Not found..."});
    }
    else {
      res.send(result);
    }
  })
})

app.get("/killDBinTest", (req, res) => {
  redis.flushall();
  res.send("Database Cleared. Enjoy!");
})


app.use("/api/clubs", clubRouter);

app.listen(
  process.env.PORT,
  () => console.log(`TechConnect Prototype listening on port ${process.env.PORT}!`) //confirmation of listening
);