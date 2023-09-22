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

// Create a new attendee record.
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

// This section will help you update an attendee record by id.
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

// This section will help you delete an attendee record
router.delete("/attendee/:id", async (req, res) => {
  const query = { _id: new ObjectId(req.params.id) };

  const collection = db.collection("Attendee");
  let result = await collection.deleteOne(query);

  res.send(result).status(200);
});

// Get all classes
router.get("/classes/", async (req, res) => {
  let collection = await db.collection("Class");
  let results = await collection.find({}).toArray();
  res.send(results).status(200);
});

// Get all sessions for a particular class
router.get("/classes/:class_id/sessions", async (req, res) => {
  const class_id = req.params.class_id;
  let collection = await db.collection("Session");
  let results = await collection.find({class_id: new ObjectId(class_id)}).toArray();
  if (results.length === 0) {
    return res.status(404).send("Not found");
  }
  res.status(200).send(results);
});



// Get all attendees for a particular session
router.get("/sessions/:session_id/attendees", async (req, res) => {
  const session_id = req.params.session_id;

  // First, query the Check_in collection to get the attendee IDs for the given session
  try {
    const checkInCollection = await db.collection("Check_in");
    const checkInResults = await checkInCollection.find({ session_id: new ObjectId(session_id) }).toArray();

    if (checkInResults.length === 0) {
      return res.status(404).send("No attendees checked in for this session.");
    }

    // Extract attendee IDs from the Check_in results
    const attendeeIds = checkInResults.map((checkIn) => checkIn.attendee_id);

    // Now, query the Attendee collection to get attendee details using attendeeIds
    const attendeeCollection = await db.collection("Attendee");
    const attendeeResults = await attendeeCollection.find({ _id: { $in: attendeeIds } }).toArray();

    if (attendeeResults.length === 0) {
      return res.status(404).send("No attendee data found for this session.");
    }

    // Combine check-in and attendee details into one array
    const combinedResults = checkInResults.map((checkIn) => {
      const attendee = attendeeResults.find((attendee) => attendee._id.equals(checkIn.attendee_id));
      return {
        _id: checkIn._id,
        checkIn: checkIn,
        attendee: attendee,
      };
    });

    res.status(200).send(combinedResults);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});



export default router;