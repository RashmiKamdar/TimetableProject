import React, { useEffect, useState } from "react";
import axios from "axios";

export default function FacultyLoadTable() {
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [timetables, setTimetables] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState("");

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [teacherRes, subjectRes, assignmentRes, timetableRes] = await Promise.all([
          axios.get("http://localhost:5000/api/teachers"),
          axios.get("http://localhost:5000/api/subjects"),
          axios.get("http://localhost:5000/api/assignments"),
          axios.get("http://localhost:5000/api/timetable"),
        ]);

        setTeachers(teacherRes.data);
        setSubjects(subjectRes.data);
        setAssignments(assignmentRes.data);
        const flatTimetables = timetableRes.data.flatMap(t => t.timetable || []);
        setTimetables(flatTimetables);
      } catch (err) {
        console.error("Error loading faculty load", err);
      }
    };

    fetchAll();
  }, []);

  const getTeacherSchedule = (teacherName) => {
    const schedule = timetables.filter(entry => entry.teacher === teacherName);
    const teacher = teachers.find(t => t.name === teacherName);

    const groupedBySubject = {};

    schedule.forEach(entry => {
      if (!groupedBySubject[entry.subject]) groupedBySubject[entry.subject] = [];
      groupedBySubject[entry.subject].push({
        day: entry.day,
        start: entry.start,
        end: entry.end,
        room: entry.room
      });
    });

    const structuredData = [];

    Object.entries(groupedBySubject).forEach(([subjectName, sessions]) => {
      sessions.forEach((session, idx) => {
        structuredData.push({
          subject: idx === 0 ? subjectName : "",
          day: session.day,
          time: `${session.start} - ${session.end}`,
          room: session.room,
          teacher: teacherName
        });
      });
    });

    return structuredData;
  };

  const displayedData = selectedTeacher ? getTeacherSchedule(selectedTeacher) : [];

  return (
    <div style={{ marginTop: 30 }}>
      <h2>📋 Faculty Load Table</h2>

      <div style={{ marginBottom: 20 }}>
        <label><strong>Select Faculty:</strong>&nbsp;</label>
        <select value={selectedTeacher} onChange={(e) => setSelectedTeacher(e.target.value)}>
          <option value="">-- Select Faculty --</option>
          {teachers.map(t => (
            <option key={t._id} value={t.name}>{t.name}</option>
          ))}
        </select>
      </div>

      {selectedTeacher && displayedData.length > 0 ? (
        <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%", textAlign: "center" }}>
          <thead style={{ backgroundColor: "#f0f0f0" }}>
            <tr>
              <th>Faculty Name</th>
              <th>Subject Name</th>
              <th>Day</th>
              <th>Timings</th>
              <th>Classroom</th>
            </tr>
          </thead>
          <tbody>
            {displayedData.map((row, i) => (
              <tr key={i}>
                <td>{row.teacher}</td>
                <td>{row.subject}</td>
                <td>{row.day}</td>
                <td>{row.time}</td>
                <td>{row.room}</td>

              </tr>
            ))}
          </tbody>
        </table>
      ) : selectedTeacher ? (
        <p>No schedule found for this faculty.</p>
      ) : null}
    </div>
  );
}
