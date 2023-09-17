import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";


// This is for Class collection
const ClassRecord = (props) => {
    const handleLinkClick = () => {
        props.sessionList(props.record._id);
    };

    return (
        <tr>
            <td>
                <Link 
                    className="btn btn-link" 
                    onClick={handleLinkClick}
                >
                    {props.record.class_name}
                </Link>
            </td>
        </tr>
    )
};

// This is for Session collection
const SessionRecord = (props) => (
    <tr>
        <td>
            <Link 
                className="btn btn-link" to={`/classes/sessions/${props.record._id}`}
            >
                {props.record.session_name}
            </Link> 
        </td>
    </tr>
);

export default function Admin() {
    const [records, setRecords] = useState([]);
    const [isSession, setIsSession] = useState(false);  // This will help us know if we're looking at sessions or classes

    useEffect(() => {
        document.title = 'Admin Page';
    }, []);
    
    useEffect(() => {
        getClassRecords();
    }, []);

    async function getClassRecords() {
        const response = await fetch(`http://localhost:5050/record/classes/`);
    
        if (!response.ok) {
            const message = `An error occurred for class: ${response.statusText}`;
            window.alert(message);
            return;
        }
        const data = await response.json();
        setRecords(data);     // Set records to classes data
        setIsSession(false);  // We set this to false to indicate that we're looking at classes
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
    }

    // This method will map out the records on the table
    function recordList() {
        if (isSession) {
          return records.map((record) => (
            <SessionRecord key={record._id} record={record} />
          ));
        } 
        else {
          return records.map((record) => (
            <ClassRecord key={record._id} record={record} sessionList={getSessionRecords} />
          ));
        }
    }

    // This following section will display the table with the records of individuals.
    return (
        <div>
          <h3>Record List</h3>
          <table className='table table-striped' style={{ marginTop: 20 }}>
            <thead>
              <tr>
                <th>{isSession ? 'Session' : 'Class'}</th>
              </tr>
            </thead>
            <tbody>{recordList()}</tbody>
          </table>
        </div>
    );
}

