import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import './TableUI.css';


const ClassRecord = ({ record }) => (
  <tr>
    <td className="large-cell">
      <Link className="btn btn-link" to={`/classes/${record._id}/sessions`}>
        {record.class_name}
      </Link>
    </td>
  </tr>
);

const SessionRecord = ({ record, classId }) => (
  <tr>
    <td className="large-cell">
      {record.session_name}
      <div style={{ float: 'right' }}>
        <Link className="btn btn-link" to={`/student-session/${record._id}`}>Student</Link>
        <Link className="btn btn-link" to={`/classes/${classId}/sessions/${record._id}/attendees`}>Admin</Link>
      </div>
    </td>
  </tr>
);

const Notification = ({ type, message, show }) => {
  if (!show) return null;
  return <div className={`alert alert-${type}`} role="alert">{message}</div>;
};

const AttendeeRow = ({ record, selectedId, setSelectedId }) => (
  <tr 
    key={record._id}
    className={record._id === selectedId ? "selected-row" : ""}
    onClick={() => !record.attended && setSelectedId(record._id)}     
  >
    <td>{`${record.first_name} ${record.last_name}`}</td>
    <td>{record.email_address}</td>
    <td>{record.attended ? 'Yes' : 'No'}</td>
  </tr>
);


// Utility function to handle data fetching with error handling
async function fetchData(url) {
  const response = await fetch(url);
  if (!response.ok) {
    const message = `An error occurred: ${response.statusText}`;
    window.alert(message);
    return null;
  }
  return await response.json();
}

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

    const handleGenerateReport = async () => {
      try {
          const response = await fetch(`http://localhost:5050/record/class-attendance-report/${classId}`);
          if (!response.ok) {
              const message = `An error occurred while generating the report: ${response.statusText}`;
              window.alert(message);
              return;
          }

           // Log all response headers
          for (var pair of response.headers.entries()) {
            console.log(pair[0]+ ': '+ pair[1]);
          }

          const className = response.headers.get('Class-Name');
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${className} Report.xlsx`
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
      } 
      catch (error) {
          console.error("Error generating the report:", error);
      }
  };
  
    return (
      <div>
        <button 
          style={{float: 'right', margin: '10px', fontSize: '20px', padding: '10px'}} 
          onClick={handleGenerateReport}>
            Generate Report
        </button>
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
      </div>
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
      async function initFetch() {
        const attendees = await fetchData(`http://localhost:5050/record/admin/attendees-for-session/${sessionId}`);
        setRecords(attendees);
        const sessionData = await fetchData(`http://localhost:5050/record/session-details/${sessionId}`);
        setSession(sessionData);
      }
      initFetch();
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
        const updatedRecords = records.map(record => {
          if (record._id === selectedId) {
            record.attended = true;
          }
          return record;
        });
        setRecords(updatedRecords);
        setSelectedId(null); // Reset the selection after successful check-in
        showNotification("Check-in successful", "success");
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
        <Notification type={notification.type} message={notification.message} show={notification.show} />
      
        <h3>Attendees for Session: {session.session_name}</h3>
        
        <div className="searchBar-container">
          <input
            className="searchBar"
            type="text"
            placeholder="Search by name"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="table-scroll-container">
          <table className="nameTable">
            <thead>
              <tr>
                  <th className="tableLabel">Full Name</th>
                  <th className="tableLabel">Email Address</th>
                  <th className="tableLabel">Attended</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((record) => (
                  <AttendeeRow
                      key={record._id}
                      record={record}   
                      onRowClick={() => !record.attended && setSelectedId(record._id)}                   
                  />
              ))}
            </tbody>
          </table>
        </div> 

        <div className="centered-button">
            <button onClick={handleCheckIn}>
                <div className="buttonName">Check In</div>
            </button>
        </div>  

    </div>
  );
}

