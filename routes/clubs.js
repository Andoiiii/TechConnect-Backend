import express from "express";
import { redis } from "../index"
export const clubRouter = express.Router();

// Clubs will Post Information about themselves
clubRouter.post("/new-club", (req, res) => {
  // Grab Relevant Information off Body
  const clubName = req.body.name;
  const clubDescription = req.body.desc;
  const clubRelevance = req.body.relv;
  const clubInterestArr = req.body.iarr;
  
  // Await Set Cardinality to determine next ID
  redis.scard("clubs:").then( (clubID) => {
    redis.set(`clubs:${clubID}:name`, clubName);
    redis.set(`clubs:${clubID}:desc`, clubDescription);
    redis.set(`clubs:${clubID}:rel`, clubRelevance);
    clubInterestArr.forEach(interest => {
      redis.sadd(`clubs:${clubID}:itrs`, interest);
    });
    redis.sadd("clubs:", clubName);
    console.log(clubID);
})
  return res.status(201).send(`Sucessfully added ${clubName} to the database.`);
});

// Get Testing Clubs to ensure it's all correct
clubRouter.get("/get-info/:id", (req, res) => {
  const clubID = req.params.id;
  redis.get(`clubs:${clubID}:name`).then((name) => {
  redis.get(`clubs:${clubID}:desc`).then((desc) => {
  redis.get(`clubs:${clubID}:rel`).then((rel) => {
  redis.smembers(`clubs:${clubID}:itrs`).then((its) => {
    res.status(200).json({
      name, desc, rel, its
    })
  })})})})})

console.log("Clubs Router Online!")