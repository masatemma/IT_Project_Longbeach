import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";  // Import useParams hook
import './TableUI.css';


// Notification Component
const Notification = ({ type, message, show }) => {
  if (!show) return null;
  return <div className={`alert alert-${type}`} role="alert">{message}</div>;
};

// Table Row Component
const TableRow = ({ record, isSelected, onRowClick, selectedId }) => (
  <tr
      key={record._id}
      className={`${isSelected ? "even-row" : ""} ${record._id === selectedId ? "selected-row" : ""}`}
      onClick={onRowClick}
  >
      <td className="fullname">{`${record.first_name} ${record.last_name}`}</td>
  </tr>
);

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
                  <th className="tableLabel">Full Name</th>
              </thead>
              <tbody>
                {filteredRecords.map((record, index) => (
                  <TableRow
                  key={record._id}
                  record={record}
                  isSelected={index % 2 === 0}
                  selectedId={selectedId}  // Pass the selectedId as a prop here
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
