import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Record = (props) => (
    <tr>
        <td>
            <Link className="btn btn-link" to={`/classes/${props.record._id}`}>{props.record.class_name}</Link>
        </td>
    </tr>
);


export default function Admin() {
    const [records, setRecords] = useState([]);

    useEffect(() => {
        document.title = 'Admin Page';
    }, []); // The empty dependency array means this effect runs once after component mounting
    
    useEffect(() => {
        async function getRecords() {
            const response = await fetch(`http://localhost:5050/record/classes`);

            if (!response.ok) {
                const message = `An error occurred: ${response.statusText}`;
                window.alert(message);
                return;
            }
          
            const records = await response.json();
            setRecords(records);
        }

        getRecords();
  
        return;

    }, [records.length]);

    // This method will map out the records on the table
    function recordList() {
        return records.map((record) => {
        return (
            <Record
            record={record}
            key={record._id}
            />
        );
        });
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