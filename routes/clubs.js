import express from "express";
import { redis } from "../index";
export const clubRouter = express.Router();

// POST club information about themselves
clubRouter.post("/club-info", (req, res) => {
  // Grab Relevant Information off Body
  const clubName = req.body.name;
  const clubDescription = req.body.desc;
  const clubRelevance = req.body.relv;
  const clubInterestArr = req.body.iarr;

  // Await Set Cardinality to determine next ID
  redis.get("clubs:ID").then((clubID) => {
    redis.set(`clubs:${clubID}:name`, clubName);
    redis.set(`clubs:${clubID}:desc`, clubDescription);
    redis.set(`clubs:${clubID}:rel`, clubRelevance);
    clubInterestArr.forEach((interest) => {
      redis.sadd(`clubs:${clubID}:itrs`, interest);
    });
    redis.set("clubs:ID", parseInt(clubID) + 1);
    redis.sadd("clubs:", parseInt(clubID));
  });
  return res.status(201).send(`Sucessfully added ${clubName} to the database.`);
});

// GET club details (testing)
clubRouter.get("/club-info/:id", (req, res) => {
  const clubID = req.params.id;
  redis.get(`clubs:${clubID}:name`).then((name) => {
    redis.get(`clubs:${clubID}:desc`).then((desc) => {
      redis.get(`clubs:${clubID}:rel`).then((rel) => {
        redis.smembers(`clubs:${clubID}:itrs`).then((its) => {
          res.status(200).json({ name, desc, rel, its });
        });
      });
    });
  });
});

// POST hackathon event to the database
clubRouter.post("/hackathon-details", (req, res) => {
  // Grab Relevant Information about Event
  const eventName = req.body.name;
  const eventLink = req.body.link;
  const eventCatArr = req.body.evts;

  // Await Set Cardinality to determine next ID
  redis.get("hacks:ID").then((hackID) => {
    redis.set(`hacks:${hackID}:name`, eventName);
    redis.set(`hacks:${hackID}:link`, eventLink);
    redis.set(`hacks:${hackID}:name`, eventName);
    eventCatArr.forEach((interest) => {
      redis.sadd(`hacks:${hackID}:type`, interest);
    });
    redis.set("hacks:ID", parseInt(hackID) + 1);
    redis.sadd("hacks:", parseInt(hackID));
  });
  return res.status(201).send(`Sucessfully added ${eventName} to the database.`);
});

// DELETE hackathon event from the database
clubRouter.delete("/hackathon-details/:id", (req, res) => {
  const delID = req.params.id;
  redis.keys(`hacks:${delID}:*`).then((array) => {
    array.forEach((key) => redis.del(key));
  });
  redis.sadd("hacks:temp", delID);
  redis.sdiffstore("hacks:", "hacks:", "hacks:temp");
  redis.del("hacks:temp");
  return res.status(201).send(`Sucessfully removed ${delID} from the database.`);
});

// GET hackathon details (testing)
clubRouter.get("/hackathon-details/:id", (req, res) => {
  const eventID = req.params.id;
  redis.get(`hacks:${eventID}:name`).then((name) => {
    redis.get(`hacks:${eventID}:link`).then((link) => {
      redis.smembers(`hacks:${eventID}:type`).then((evts) => {
        res.status(200).json({ name, link, evts });
      });
    });
  });
});


// Breaker Function
async function displayClub(clubID, eventID) {
  let retStruct = {};
  await redis.get(`clubs:${clubID}:name`, (err, result) => { retStruct.name = result;})
  await redis.get(`clubs:${clubID}:desc`, (err, result) => { retStruct.desc = result;})
  await redis.get(`clubs:${clubID}:rel`, (err, result) => { retStruct.relevance = result;})

  await redis.get(`hacks:${eventID}:name`, (err, result) => { retStruct.hackathon = result;})
  await redis.get(`hacks:${eventID}:link`, (err, result) => { retStruct.linkToHackathon = result;})
  await redis.sinter(`clubs:${clubID}:itrs`, `hacks:${eventID}:type`, (err,result) => { retStruct.events = result;})

  return retStruct;
}

// GET for the end user - proper formatting etc
clubRouter.get("/peek/:club/:event", async (req, res) => {
  const clubID = req.params.club;
  const eventID = req.params.event;

  res.json(await displayClub(clubID,eventID))
})



console.log("Clubs Router Online!");
