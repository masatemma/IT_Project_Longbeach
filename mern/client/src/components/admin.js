import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import './Admin.css';

// This is for Class collection
const ClassRecord = (props) => {
    return (
        <tr>
            <td className="large-cell">
                <Link 
                    className="btn btn-link" 
                    to={`/classes/${props.record._id}/sessions`}
                >
                    {props.record.class_name}
                </Link>
            </td>
        </tr>
    )
};


// This is for Session collection
const SessionRecord = (props) => {
    return (
        <tr>
            <td className="large-cell">
                {props.record.session_name}
                <div style={{float: 'right'}}>
                    <Link 
                        className="btn btn-link"
                        to={`/student-session/${props.record._id}`}
                    >
                        Student
                    </Link>
                    <Link 
                        className="btn btn-link"
                        to={`/classes/${props.classId}/sessions/${props.record._id}/attendees`}
                    >
                        Admin
                    </Link> 
                </div>
            </td>
        </tr>
    )
};

export function Classes() {
    const [records, setRecords] = useState([]);
    useEffect(() => {
      async function getClassRecords() {
        const response = await fetch(`http://localhost:5050/record/classes`);
        if (!response.ok) {
          const message = `An error occurred for class: ${response.statusText}`;
          window.alert(message);
          return;
        }
        const data = await response.json();
        setRecords(data);
      }
  
      getClassRecords();
    }, []);
  
    return (
      <table className='table table-striped' style={{ marginTop: 20 }}>
        <thead>
          <th className="large-cell" style={{width: '100%'}}>Class</th>
        </thead>
        <tbody>
          {records.map((record) => (
            <ClassRecord key={record._id} record={record} />
          ))}
        </tbody>
      </table>
    );
}

export function Sessions() {
    const { classId } = useParams();
    const [records, setRecords] = useState([]);
  
    useEffect(() => {
      async function getSessionRecords() {
        const response = await fetch(`http://localhost:5050/record/classes/${classId}/sessions`);
        if (!response.ok) {
          const message = `An error occurred for session: ${response.statusText}`;
          window.alert(message);
          return;
        }
        const data = await response.json();
        setRecords(data);
      }
  
      getSessionRecords();
    }, [classId]);
  
    return (
      <table className='table table-striped' style={{ marginTop: 20 }}>
        <thead>
          <th className="large-cell" style={{width: '100%'}}>Session</th>
        </thead>
        <tbody>
          {records.map((record) => (
            <SessionRecord key={record._id} record={record} classId={classId} />
          ))}
        </tbody>
      </table>
    );
}

export function Attendees() {
    const { sessionId } = useParams();
    const [records, setRecords] = useState([]);
    const [session, setSession] = useState({});  // New state variable for session details
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedId, setSelectedId] = useState(null);
    const [notification, setNotification] = useState({ show: false, message: "", type: "" });

    useEffect(() => {
      async function fetchData() {
        // Fetch attendees
        const responseAttendees = await fetch(`http://localhost:5050/record/admin/attendees-for-session/${sessionId}`);
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
              <th>Email Address</th>
              <th>Attended</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.map((record) => (
              <tr 
                key={record._id} 
                style={selectedId === record._id ? { backgroundColor: 'green' } : {}}
                onClick={() => setSelectedId(record._id)}
              >
                <td>{`${record.first_name} ${record.last_name}`}</td>
                <td>{record.email_address}</td>
                <td>{record.attended ? 'Yes' : 'No'}</td>
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

