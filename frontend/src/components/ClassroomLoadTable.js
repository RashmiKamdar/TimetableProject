// src/components/ClassroomLoadPage.js

import React, { useEffect, useState } from "react";
import axios from "axios";

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export default function ClassroomLoadPage() {
  const [classrooms, setClassrooms] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [timetables, setTimetables] = useState([]);
  const [selectedClassroom, setSelectedClassroom] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      const [roomRes, subjectRes, timetableRes] = await Promise.all([
        axios.get("http://localhost:5000/api/rooms"),
        axios.get("http://localhost:5000/api/subjects"),
        axios.get("http://localhost:5000/api/timetable"),
      ]);
      setClassrooms(roomRes.data);
      setSubjects(subjectRes.data);
      setTimetables(timetableRes.data.flatMap(t => t.timetable || []));
    };
    fetchAll();
  }, []);

  const getClassroomSchedule = (roomIdentifier) => {
    return timetables
      .filter(entry => entry.room && entry.room.includes(roomIdentifier))
      .map(entry => {
        const subj = subjects.find(s => s.name === entry.subject);
        return {
          day: entry.day,
          time: `${entry.start} - ${entry.end}`,
          subject: entry.subject,
          teacher: entry.teacher,
          department: subj?.department || "-",
          semester: subj?.semester || "-",
        };
      });
  };

  const renderGroupedSchedule = (schedule) => {
    const grouped = {};

    WEEKDAYS.forEach(day => {
      grouped[day] = schedule.filter(item => item.day === day);
    });

    return (
      <div style={{ marginTop: 20 }}>
        {WEEKDAYS.map(day => (
          grouped[day].length > 0 && (
            <div key={day} style={{ marginBottom: 20 }}>
              <h3>{day}</h3>
              <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Subject</th>
                    <th>Teacher</th>
                    <th>Department</th>
                    <th>Semester</th>
                  </tr>
                </thead>
                <tbody>
                  {grouped[day].map((entry, index) => (
                    <tr key={index}>
                      <td>{entry.time}</td>
                      <td>{entry.subject}</td>
                      <td>{entry.teacher}</td>
                      <td>{entry.department}</td>
                      <td>{entry.semester}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ))}
      </div>
    );
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>📘 Classroom Load</h2>
      
      <div>
        <label>Select Classroom:</label>
        <select
          onChange={(e) => {
            const selected = classrooms.find(c => c._id === e.target.value);
            setSelectedClassroom(selected);
          }}
          defaultValue=""
        >
          <option value="" disabled>Select a classroom</option>
          {classrooms.map(c => (
            <option key={c._id} value={c._id}>
              {c.roomNumber} ({c.location})
            </option>
          ))}
        </select>
      </div>

      {selectedClassroom && (
        <>
          <div style={{ marginTop: 20 }}>
            <strong>Room:</strong> {selectedClassroom.roomNumber} <br />
            <strong>Location:</strong> {selectedClassroom.location}
          </div>

          {renderGroupedSchedule(getClassroomSchedule(selectedClassroom.roomNumber))}
        </>
      )}
    </div>
  );
}
