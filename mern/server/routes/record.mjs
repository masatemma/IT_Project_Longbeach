import express from "express";
import db from "../db/conn.mjs";
import { ObjectId } from "mongodb";

const router = express.Router();

// This section will help you get a list of all the records.
router.get("/", async (req, res) => {
  let collection = await db.collection("Attendee");
  let results = await collection.find({}).toArray();
  res.send(results).status(200);
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
router.get("/", async (req, res) => {
  try {
    let collection = await db.collection("Check-in");
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

export default router;