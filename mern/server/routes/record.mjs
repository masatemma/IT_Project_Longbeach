import express from "express";
import db from "../db/conn.mjs";
import { ObjectId } from "mongodb";

const router = express.Router();

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

// This section will help you check-in a person by session_id and attendee_id.
router.patch("/checkin/:session_id/:attendee_id", async (req, res) => {
  console.log("Check-in request received for session_id:", req.params.session_id, "and attendee_id:", req.params.attendee_id);  // Debug log

  const query = { 
    session_id: new ObjectId(req.params.session_id),
    attendee_id: new ObjectId(req.params.attendee_id)
  };
  const checkin_data = await db.collection("Check_in").findOne(query);

  if (!checkin_data) {
    console.log("No attendee found for session_id:", req.params.session_id, "and attendee_id:", req.params.attendee_id);  // Debug log
    return res.status(404).send("Attendee not found");
  }

  if (checkin_data.attended) {
    return res.status(400).send("Already checked in");
  }

  const updates = { $set: { attended: true } };
  await db.collection("Check_in").updateOne(query, updates); // Update the "Check_in" collection
  res.status(200).send("Check-in successful");
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

    // Create a map of attendee_id to Check_in document
    const checkInMap = {};
    checkInResults.forEach((checkIn) => {
      checkInMap[checkIn.attendee_id] = checkIn;
    });

    // Extract attendee IDs from the Check_in results
    const attendeeIds = Object.keys(checkInMap);

    // Now, query the Attendee collection to get attendee details using attendeeIds
    const attendeeCollection = await db.collection("Attendee");
    const attendeeResults = await attendeeCollection.find({ _id: { $in: attendeeIds.map(id => new ObjectId(id)) } }).toArray();

    // Add the _id and attended status of the Check_in document to each attendee result
    const resultsWithCheckInId = attendeeResults.map((attendee) => {
      const checkIn = checkInMap[attendee._id];
      return {
        ...attendee,
        check_in_id: checkIn._id,
        attended: checkIn.attended
      };
    });

    if (resultsWithCheckInId.length === 0) {
      return res.status(404).send("No attendee data found for this session.");
    }

    res.status(200).send(resultsWithCheckInId);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

/*
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

    res.status(200).send(attendeeResults);
  } catch (error) {
    console.error(error);
  };
});
*/

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