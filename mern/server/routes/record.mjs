import express from "express";
import db from "../db/conn.mjs";
import { ObjectId } from "mongodb";
import ExcelJS from "exceljs";
//const ExcelJS = require('exceljs');

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

// This section will help you get a list of all the check-ins with attendee details
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

// This section will help you get a list of all attendee details for a specific session (Admin).
router.get("/admin/attendees-for-session/:sessionId", async (req, res) => {
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
          email_address: "$attendeeDetails.email_address",
          attended: 1
        }
      }
    ]).toArray();
    
    res.status(200).send(results);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});


// This section will help you get a list of all attendee details for a specific session (for false attended)
router.get("/attendees-for-session/:sessionId", async (req, res) => {
  try {
    let collection = await db.collection("Check_in");
    let results = await collection.aggregate([
      { $match: { session_id: new ObjectId(req.params.sessionId) }},
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


router.get("/class-attendance-report/:classId", async (req, res) => {
  try {
    console.log("here");
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Attendance Report');

    // Add headers to the worksheet
    worksheet.addRow(['Session', 'Attendees', 'Attendances', 'Percentage']);

    let classCollection = await db.collection("Class");
    let classRes = await classCollection.findOne({_id: new ObjectId(req.params.classId)});

    let sessionCollection = await db.collection("Session");
    let sessionQuery = {class_id: new ObjectId(req.params.classId)};
    let sessions = await sessionCollection.find(sessionQuery).toArray();

    let totalAttendees = 0;
    let totalAttendances = 0;

    for (const session of sessions) {
      let sessionAttendees = 0;
      let sessionAttendances = 0;

      let checkInCollection = await db.collection("Check_in");
      let checkInQuery = {session_id: new ObjectId(session._id)};
      let sessionCheckIns = await checkInCollection.find(checkInQuery).toArray();

      for (const checkIn of sessionCheckIns) {
        sessionAttendees++;
        if (checkIn.attended) 
          sessionAttendances++;
      }
      
      let attendancePCent = 0;

      if (sessionAttendees > 0)
        attendancePCent = (sessionAttendances / sessionAttendees * 100).toFixed(2);

      worksheet.addRow([
        session.session_name, 
        sessionAttendees.toString(), 
        sessionAttendances.toString(),
        attendancePCent.toString()
      ]);

      totalAttendees += sessionAttendees;
      totalAttendances += sessionAttendances;
    }

    let attendancePCent = 0;

    if (totalAttendees > 0)
      attendancePCent = (totalAttendances / totalAttendees * 100).toFixed(2);

    worksheet.addRow([
      'Total', 
      totalAttendees.toString(), 
      totalAttendances.toString(),
      attendancePCent.toString()
    ]);

    console.log(classRes.class_name);

    // Set response headers to indicate it's an Excel file
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=' + classRes.class_name
    + ' Report.xlsx');
    res.setHeader('Class-Name', classRes.class_name);
    console.log(res.getHeaders());
    
    // Send the Excel file as the response
    workbook.xlsx.write(res)
    .then(() => {
      res.end();
    });
  } 
  catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

export default router;