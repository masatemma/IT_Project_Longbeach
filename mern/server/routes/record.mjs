import express from "express";
import db from "../db/conn.mjs";
import { ObjectId } from "mongodb";

const router = express.Router();

// This section will help you get a list of all the records.
router.get("/", async (req, res) => {
  let collection = await db.collection("Attendee");
  let results = await collection.find({}).toArray();
  res.status(200).send(results);
});

// This section will help you get a single record by id
router.get("/:id", async (req, res) => {
  let collection = await db.collection("Attendee");
  let query = {_id: new ObjectId(req.params.id)};
  let result = await collection.findOne(query);

  if (!result) res.send("Not found").status(404);
  else res.send(result).status(200);
});

// Create a new record.
router.post("/", async (req, res) => {
  let newDocument = {
    first_name: req.body.first_name,  
    last_name: req.body.last_name,    
    email_address: req.body.email_address  
  };
  let collection = await db.collection("Attendee");  
  let result = await collection.insertOne(newDocument);
  res.status(201).send(result); 
});

// This section will help you update a record by id.
router.patch("/:id", async (req, res) => {
  const query = { _id: new ObjectId(req.params.id) };
  const updates =  {
    $set: {
      first_name: req.body.first_name,  
      last_name: req.body.last_name,  
      email_address: req.body.email_address 
    }
  };

  let collection = await db.collection("Attendee");
  let result = await collection.updateOne(query, updates);

  res.send(result).status(200);
});

// This section will help you delete a record
router.delete("/:id", async (req, res) => {
  const query = { _id: new ObjectId(req.params.id) };

  const collection = db.collection("Attendee");
  let result = await collection.deleteOne(query);

  res.send(result).status(200);
});

// This section will help you get a list of all the check-ins with attendee details.
router.get("/checkin", async (req, res) => {
  try {
    let collection = await db.collection("Check_in");
    let results = await collection.aggregate([
      {
        $lookup: {
          from: "Attendee",
          localField: "attendee_id",
          foreignField: "_id",
          as: "attendeeDetails"
        }
      },
      {
        $unwind: "$attendeeDetails"
      },
      {
        $project: {
          first_name: "$attendeeDetails.first_name",
          last_name: "$attendeeDetails.last_name",
          attended: 1
        }
      }
    ]).toArray();
    res.status(200).send(results);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

// This section will help you get a list of all attendee details for a specific session.
router.get("/attendees-for-session/:sessionId", async (req, res) => {
  try {
    let collection = await db.collection("Check_in");
    let results = await collection.aggregate([
      { $match: { session_id: new ObjectId(req.params.sessionId) } },
      {
        $lookup: {
          from: "Attendee",
          localField: "attendee_id",
          foreignField: "_id",
          as: "attendeeDetails"
        }
      },
      {
        $unwind: "$attendeeDetails"
      },
      {
        $project: {
          first_name: "$attendeeDetails.first_name",
          last_name: "$attendeeDetails.last_name",
        }
      }
    ]).toArray();
    
    res.status(200).send(results);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

// This section will help you get a single session by its ID
router.get("/session-details/:sessionId", async (req, res) => {
  try {
    let collection = await db.collection("Session");
    let query = {_id: new ObjectId(req.params.sessionId)};
    let result = await collection.findOne(query);

    if (!result) res.send("Not found").status(404);
    else res.send(result).status(200);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});


// This section will help you check-in a person by id.
router.patch("/checkin/:id", async (req, res) => {
  console.log("Check-in request received for id:", req.params.id);  // Debug log

  const query = { _id: new ObjectId(req.params.id) };
  const checkin_data = await db.collection("Check_in").findOne(query);

  if (!checkin_data) {
    console.log("No attendee found for id:", req.params.id);  // Debug log
    return res.status(404).send("Attendee not found");
  }

  if (checkin_data.attended) {
    return res.status(400).send("Already checked in");
  }

  const updates = { $set: { attended: true } };
  await db.collection("Check_in").updateOne(query, updates); // Update the "Check_in" collection
  res.status(200).send("Check-in successful");
});

export default router;