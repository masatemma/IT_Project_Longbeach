import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import './admin.css';


// This is for Class collection
const ClassRecord = (props) => {
    const handleClassLinkClick = () => {
        props.sessionList(props.record._id);
    };

    return (
        <tr>
            <td className="large-cell">
                <Link 
                    className="btn btn-link" 
                    onClick={handleClassLinkClick}
                >
                    {props.record.class_name}
                </Link>
            </td>
        </tr>
    )
};

// This is for Session collection
const SessionRecord = (props) => {
    const handleSessionLinkClick = () => {
        props.attendeeList(props.record._id);
    };
    return (
        <tr>
            <td className="large-cell">
                <Link 
                    className="btn btn-link"
                    onClick={handleSessionLinkClick}
                >
                    {props.record.session_name}
                </Link> 
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

