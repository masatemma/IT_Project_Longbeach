import React from "react";
 
// We use Route in order to define the different routes of our application
import { Route, Routes } from "react-router-dom";
 
// We import all the components we need in our app
import Navbar from "./components/navbar";
import CheckIn from "./components/checkin";
import SessionAttendees from "./components/SessionAttendees";
 
const App = () => {
 return (
   <div>
     <Navbar />
     <Routes>
       <Route exact path="/" element={<CheckIn />} />
       <Route path="/session/:sessionId" element={<SessionAttendees />} />
     </Routes>
   </div>
 );
};

/* No need to use the other components. Redirect immediately to /admin.
 */
const App = () => {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<RedirectToAdmin />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </div>
  );
};

export default App;
