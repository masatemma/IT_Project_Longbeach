import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
 
// We import all the components we need in our app
import Navbar from "./components/Navbar";
//import CheckIn from "./components/checkin";
import { Classes, Sessions, Attendees} from "./components/Admin";
import SessionAttendees from "./components/SessionAttendees";

const App = () => {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/classes" />} />
        <Route path="/classes" element={<Classes />} />
        <Route path="/classes/:classId/sessions" element={<Sessions />} />
        <Route path="/classes/:classId/sessions/:sessionId/attendees" element={<Attendees />} />
        <Route path="/student-session/:sessionId" element={<SessionAttendees />} />
      </Routes>
    </div>
  );
};

export default App;
