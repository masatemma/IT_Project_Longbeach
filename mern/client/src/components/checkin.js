import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
 
const Record = (props) => (
  <tr>
    <td>{props.record.first_name}</td>
    <td>{props.record.last_name}</td>
    <td>{props.record.attended ? "Yes" : "No"}</td>
    <td>
      <button 
        className="btn btn-primary" 
        disabled={props.record.attended}
        onClick={() => props.handleCheckIn(props.record._id)}
      >
        Check-In
      </button>
    </td>
  </tr>
);

// Updated CheckIn component
export default function CheckIn() {
  const [records, setRecords] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });
  
  useEffect(() => {
    async function getRecords() {
      const response = await fetch(`http://localhost:5050/record/`);
  
      if (!response.ok) {
        const message = `An error occurred: ${response.statusText}`;
        window.alert(message);
        return;
      }
  
      const records = await response.json();
      setRecords(records);
    }
  
    getRecords();

  }, []);

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
      <h3>Attendance System</h3>
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

