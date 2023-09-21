import React, { useEffect, useState } from "react";
import { Routes, Route, Link, useParams } from "react-router-dom";
import './admin.css';

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

// This is for Attendees collection
const AttendeeRecord = (props) => {
    return (
        <tr>
            <td className="large-cell" style={{width: '33%'}}>{props.record.first_name}</td>
            <td className="large-cell" style={{width: '33%'}}>{props.record.last_name}</td>
            <td className="large-cell" style={{width: '34%'}}>{props.record.email_address}</td>
        </tr>
    );
};

export function Admin() {
    console.log("admin");
    return (
        <Routes>
            <Route path="/classes/:classId/sessions/:sessionId/attendees" element={<Attendees />} />
            <Route path="/classes/:classId/sessions" element={<Sessions />} />
            <Route path="/classes" element={<Classes />} />
        </Routes>
    );
}

export function Classes() {
    console.log("classes");
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
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedId, setSelectedId] = useState(null);
    const [notification, setNotification] = useState({ show: false, message: "", type: "" });

    useEffect(() => {
      async function getAttendeeRecords() {
        const response = await fetch(`http://localhost:5050/record/sessions/${sessionId}/attendees`);
        if (!response.ok) {
          const message = `An error occurred for attendee: ${response.statusText}`;
          window.alert(message);
          return;
        }
        const data = await response.json();
        setRecords(data);
      }
  
      getAttendeeRecords();
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
  
      const response = await fetch(`http://localhost:5050/record/checkin/${sessionId}/${selectedId}`, {
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
        <h3>Attendees for Session: {sessionId}</h3>
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
                style={selectedId === record._id ? { backgroundColor: '#f2f2f2' } : {}}
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
  

/*
export default function Admin() {
    const [records, setRecords] = useState([]);
    const [isSession, setIsSession] = useState(false);  // This will help us know if we're looking at sessions or classes
    const [isAttendee, setIsAttendee] = useState(false);

    useEffect(() => {
        document.title = 'Admin Page';
    }, []);
    
    useEffect(() => {
        getClassRecords();
    }, []);

    async function getClassRecords() {
        const response = await fetch(`http://localhost:5050/record/classes`);
    
        if (!response.ok) {
            const message = `An error occurred for class: ${response.statusText}`;
            window.alert(message);
            return;
        }
        const data = await response.json();
        setRecords(data);     // Set records to classes data
        setIsSession(false);  // We set this to false to indicate that we're looking at classes
        setIsAttendee(false);
    }

    async function getSessionRecords(class_id) {
        // This is where you'd make your API call to get sessions by class ID.
        const response = await fetch(`http://localhost:5050/record/classes/${class_id}/sessions`);
        if (!response.ok) {
            const message = `An error occurred for session: ${response.statusText}`;
            window.alert(message);
            return;
        }
        const data = await response.json();
        setRecords(data);    // Set records to sessions data
        setIsSession(true);  // We set this to true to indicate that we're looking at sessions
        setIsAttendee(false);
    }

    async function getAttendeeRecords(session_id) {
        // This is where you'd make your API call to get sessions by class ID.
        const response = await fetch(`http://localhost:5050/record/sessions/${session_id}/attendees`);
        if (!response.ok) {
            const message = `An error occurred for session: ${response.statusText}`;
            window.alert(message);
            return;
        }
        const data = await response.json();
        setRecords(data);    // Set records to sessions data
        setIsSession(false);  // We set this to true to indicate that we're looking at sessions
        setIsAttendee(true);
    }

    // This method will map out the records on the table
    function recordList() {
        if (isSession) {
          return records.map((record) => (
            <SessionRecord key={record._id} record={record} attendeeList={getAttendeeRecords}/>
          ));
        } 
        else if (isAttendee) {
          return records.map((record) => (
            <AttendeeRecord key={record._id} record={record}/>
          ));
        } 
        else {
          return records.map((record) => (
            <ClassRecord key={record._id} record={record} sessionList={getSessionRecords} />
          ));
        }
    }

    function get_table() {
        if (isSession) {
            return [<th className="large-cell" style={{width: '100%'}} key="session">Session</th>];
        } else if (isAttendee) {
            return [
                <th className="large-cell" style={{width: '33%'}} key="first_name">First Name</th>,
                <th className="large-cell" style={{width: '33%'}} key="last_name">Last Name</th>,
                <th className="large-cell" style={{width: '34%'}} key="email">Email Address</th>
            ];
        } else {
            return [<th className="large-cell" style={{width: '100%'}} key="class">Class</th>];
        }
    }

    // This following section will display the table with the records of individuals.
    return (
        <div>
          <table className='table table-striped' style={{ marginTop: 20 }}>
            <thead>
              {get_table()}
            </thead>
            <tbody>{recordList()}</tbody>
          </table>
        </div>
    );
}
*/

