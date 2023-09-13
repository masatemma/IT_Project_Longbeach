import express from "express";
import db from "../db/conn.mjs";
import { ObjectId } from "mongodb";

const router = express.Router();

// This section will help you get a list of all the records.
router.get("/attendee/", async (req, res) => {
  let collection = await db.collection("Attendee");
  let results = await collection.find({}).toArray();
  res.send(results).status(200);
});

// This section will help you get a single record by id
router.get("/attendee/:id", async (req, res) => {
  let collection = await db.collection("Attendee");
  let query = {_id: new ObjectId(req.params.id)};
  let result = await collection.findOne(query);

  if (!result) res.send("Not found").status(404);
  else res.send(result).status(200);
});

router.get("/classes/", async (req, res) => {
  let collection = await db.collection("Class");
  let results = await collection.find({}).toArray();
  res.send(results).status(200);
});

router.post("/classes/", async (req, res) => {
  let collection = await db.collection("Session");
  let query = {_id: new ObjectId(req.params.class_id)};
  let result = await collection.findOne(query);

  if (!result) res.send("Not found").status(404);
  else res.send(result).status(200);
});

// Create a new record.
router.post("/attendee/", async (req, res) => {
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
router.patch("/attendee/:id", async (req, res) => {
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
router.delete("/attendee/:id", async (req, res) => {
  const query = { _id: new ObjectId(req.params.id) };

  const collection = db.collection("Attendee");
  let result = await collection.deleteOne(query);

  res.send(result).status(200);
});

export default router;