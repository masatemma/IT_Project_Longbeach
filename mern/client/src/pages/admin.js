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
                sessionName="btn btn-link" to={`/classes/sessions/${props.record._id}`}
            >
                {props.record.session_name}
            </Link>
        </td>
    </tr>
);




export default function Admin() {
    const [records, setRecords, sessionBool] = useState([]);

    useEffect(() => {
        document.title = 'Admin Page';
        const sessionBool = false;
        console.log("HERE");
    }, []); // The empty dependency array means this effect runs once after component mounting
    
    useEffect(() => {
        
        getClassRecords();

  
        return;

    }, [records.length]);

    // This method will map out the records on the table
    function recordList() {
        return records.map((record) => {
            return (
                <ClassRecord
                record={record}
                sessionList={sessionList}
                key={record._id}
                />
            );
        });
    }

    async function getClassRecords() {
        const response = await fetch(`http://localhost:5050/record/classes`);
    
        if (!response.ok) {
            const message = `An error occurred: ${response.statusText}`;
            window.alert(message);
            return;
        }
      
        const records = await response.json();
        setRecords(records);
    }

    async function sessionList(class_id) {
        console.log("HERE");
        const req = {
            class_id: class_id 
        };
    
        const response = await fetch(`http://localhost:5050/record/classes`, {
            method: "POST", // Use the appropriate HTTP method (e.g., POST)
            headers: {
                "Content-Type": "application/json", // Set the content type based on your data
            },
            body: JSON.stringify(req), // Convert data to JSON format if needed
        });

        if (!response.ok) {
            const message = `An error occurred: ${response.statusText}`;
            window.alert(message);
            return;
        }
      
        const records = await response.json();
        setRecords(records);
    }

    // This following section will display the table with the records of individuals.
    return (
        <div>
        <h3>Record List</h3>
        <table className="table table-striped" style={{ marginTop: 20 }}>
            <thead>
            <tr>
                <th>Class</th>          
            </tr>
            </thead>
            <tbody>{recordList()}</tbody>
        </table>
        </div>
    );
}

