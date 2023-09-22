import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";  // Import useParams hook

export default function SessionAttendees() {
    const [records, setRecords] = useState([]);
    const [session, setSession] = useState({});  // New state variable for session details
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedId, setSelectedId] = useState(null);
    const [notification, setNotification] = useState({ show: false, message: "", type: "" });
    
    const { sessionId } = useParams();  

    useEffect(() => {
      async function fetchData() {
        // Fetch attendees
        const responseAttendees = await fetch(`http://localhost:5050/record/attendees-for-session/${sessionId}`);
        if (!responseAttendees.ok) {
          const message = `An error occurred: ${responseAttendees.statusText}`;
          window.alert(message);
          return;
        }
        const attendees = await responseAttendees.json();
        setRecords(attendees);
    
        // Fetch session details
        const responseSession = await fetch(`http://localhost:5050/record/session-details/${sessionId}`);
        if (!responseSession.ok) {
          const message = `An error occurred: ${responseSession.statusText}`;
          window.alert(message);
          return;
        }
        const sessionData = await responseSession.json();
        setSession(sessionData);
      }
    
      fetchData();
    }, [sessionId]);

    function showNotification(message, type) {
      setNotification({ show: true, message, type });
      setTimeout(() => {
        setNotification({ show: false, message: "", type: "" });
      }, 3000);
    }

    async function handleCheckIn() {
      if (!selectedId) {
        showNotification("Please select an attendee to check in.", "warning");
        return;
      }
  
      const response = await fetch(`http://localhost:5050/record/checkin/${selectedId}`, {
        method: "PATCH"
      });
      
      if (response.ok) {
        showNotification("Check-in successful", "success");
        const updatedRecords = records.map(record => {
          if (record._id === selectedId) {
            record.attended = true;
          }
          return record;
        });
        setRecords(updatedRecords);
      } else {
        const message = await response.text();
        showNotification(`Check-in failed: ${message}`, "danger");
        
      }
    }

    const filteredRecords = records.filter(record => {
      const fullName = `${record.first_name} ${record.last_name}`.toLowerCase();
      return fullName.includes(searchTerm.toLowerCase());
    });

    return (
    <div className="container">
      {notification.show && (
        <div className={`alert alert-${notification.type}`} role="alert">
          {notification.message}
        </div>
      )}
      <h3>Attendees for Session: {session.session_name}</h3>
      <input
        type="text"
        placeholder="Search by name"
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
      />
      <div style={{ height: '300px', overflowY: 'scroll' }}>
        <table className="table table-striped" style={{ marginTop: 20 }}>
          <thead>
            <tr>
              <th>Full Name</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.map((record) => (
              <tr 
                key={record._id} 
                style={selectedId === record._id ? { backgroundColor: '#f2f2f2' } : {}}
                onClick={() => !record.attended && setSelectedId(record._id)}
              >
                <td>{`${record.first_name} ${record.last_name}`}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button onClick={handleCheckIn}>
        Check-In
      </button>
    </div>
  );
}
