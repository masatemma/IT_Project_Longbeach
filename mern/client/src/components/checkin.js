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
  
  async function handleCheckIn(id) {
    const response = await fetch(`http://localhost:5050/record/checkin/${id}`, {
      method: "PATCH"
    });

    if (response.ok) {
      alert("Check-in successful");
      const updatedRecords = records.map(record => {
        if (record._id === id) {
          record.attended = true;
        }
        return record;
      });
      setRecords(updatedRecords);
    } else {
      const message = await response.text();
      alert(`Check-in failed: ${message}`);
    }
  }

  
  function checkin() {
    return records.map((record) => {
      return (
        <Record
          record={record}
          handleCheckIn={handleCheckIn}
          key={record._id}
        />
      );
    });
  }
  
  return (
    <div>
      <h3>Attendance System</h3>
      <table className="table table-striped" style={{ marginTop: 20 }}>
        <thead>
          <tr>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Attended</th>
          </tr>
        </thead>
        <tbody>{checkin()}</tbody>
      </table>
    </div>
  );
}