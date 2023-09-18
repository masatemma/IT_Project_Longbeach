import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";  // Import useParams hook

export default function SessionAttendees() {
    const [records, setRecords] = useState([]);
    const [session, setSession] = useState({});  // New state variable for session details
    
    const { sessionId } = useParams();  

  useEffect(() => {
    async function getAttendees() {
      const response = await fetch(`http://localhost:5050/record/attendees-for-session/${sessionId}`);
  
      if (!response.ok) {
        const message = `An error occurred: ${response.statusText}`;
        window.alert(message);
        return;
      }
  
      const attendees = await response.json();
      setRecords(attendees);
    }
  
    getAttendees();
  }, [sessionId]);  // Add sessionId as a dependency
  
  // New useEffect to fetch session details
  useEffect(() => {
    async function getSessionDetails() {
      const response = await fetch(`http://localhost:5050/record/session-details/${sessionId}`);
      if (!response.ok) {
        const message = `An error occurred: ${response.statusText}`;
        window.alert(message);
        return;
      }
      const sessionData = await response.json();
      setSession(sessionData);      
    }
    getSessionDetails();
  }, [sessionId]);

  return (
    <div>
      <h3>Attendees for Session: {session.session_name}</h3>
      {records.length === 0 ? (
        <p>No attendees</p>
      ) : (
        <table className="table table-striped" style={{ marginTop: 20 }}>
          <thead>
            <tr>
              <th>First Name</th>
              <th>Last Name</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record._id}>
                <td>{record.first_name}</td>
                <td>{record.last_name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
);

}
