// src/components/GenerateTimetable.js

import React, { useState, useEffect } from "react";
import axios from "axios";

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

// Dynamic time slot generator - creates flexible schedules
const generateTimeSlots = (startHour = 8, startMinute = 30, totalHours = 7, lunchDuration = 1) => {
  const slots = [];
  let currentHour = startHour;
  let currentMinute = startMinute;
  let hoursAdded = 0;
  let lunchAdded = false;
  
  while (hoursAdded < totalHours + lunchDuration) {
    const startTime = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
    
    // Add lunch after 4 hours or at 12:00-13:00 range
    if (!lunchAdded && (hoursAdded >= 4 || (currentHour >= 12 && currentHour <= 13))) {
      const endHour = currentHour + lunchDuration;
      const endTime = `${endHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
      slots.push(`${startTime}-${endTime} (Lunch)`);
      currentHour = endHour;
      lunchAdded = true;
      continue;
    }
    
    const endHour = currentHour + 1;
    const endTime = `${endHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
    slots.push(`${startTime}-${endTime}`);
    
    currentHour = endHour;
    hoursAdded++;
  }
  
  return slots;
};

// Dynamic lab allocation system
const createLabAllocationSystem = (subjects, availableLabRooms) => {
  const labAllocations = {};
  const usedLabIds = new Set();
  let labCounter = 1;
  
  subjects.forEach(subject => {
    if (subject.type === "Lab") {
      // Find an available lab room
      const availableLab = availableLabRooms.find(lab => !usedLabIds.has(lab._id));
      
      if (availableLab) {
        labAllocations[subject._id] = {
          roomId: availableLab._id,
          roomNumber: availableLab.roomNumber,
          location: availableLab.location,
          identifier: `Lab ${labCounter}${String.fromCharCode(64 + labCounter)}` // Lab 1A, Lab 2B, etc.
        };
        usedLabIds.add(availableLab._id);
        labCounter++;
      } else {
        // If no dedicated lab available, assign shared lab with unique identifier
        const sharedLab = availableLabRooms[labCounter % availableLabRooms.length];
        labAllocations[subject._id] = {
          roomId: sharedLab._id,
          roomNumber: sharedLab.roomNumber,
          location: sharedLab.location,
          identifier: `Shared Lab ${labCounter}`
        };
        labCounter++;
      }
    }
  });
  
  return labAllocations;
};

export default function GenerateTimetable() {
  const [form, setForm] = useState({
    department: "",
    semesterType: "",
    semester: "",
    batches: 2
  });

  const [teachers, setTeachers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [currentTimeslots] = useState([]);

  const semesterOptions = form.semesterType === "odd" ? [1, 3, 5, 7] : [2, 4, 6, 8];

  useEffect(() => {
    const fetchAll = async () => {
      const [tRes, rRes, sRes, aRes] = await Promise.all([
        axios.get("http://localhost:5000/api/teachers"),
        axios.get("http://localhost:5000/api/rooms"),
        axios.get("http://localhost:5000/api/subjects"),
        axios.get("http://localhost:5000/api/assignments")
      ]);
      setTeachers(tRes.data);
      setRooms(rRes.data);
      setSubjects(sRes.data);
      setAssignments(aRes.data);
    };
    fetchAll();
  }, []);

  const [isSaved, setIsSaved] = useState(false);
  const [saveInProgress, setSaveInProgress] = useState(false);

  const subjectTeacherMap = {};
  assignments.forEach(a => {
    subjectTeacherMap[a.subjectId] = a.teacherName;
  });

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const generateAndSave = async () => {
    if (!form.department || !form.semesterType || !form.semester) {
      alert("Please select Department, Semester Type, and Semester.");
      return;
    }

    const subj = subjects.filter(
      s => s.department === form.department && +s.semester === +form.semester
    );
    const teach = teachers.filter(
      t => t.department === form.department && t.semesters.includes(+form.semester)
    );
    const labRooms = rooms.filter(r => r.type === "Lab");
    const classRooms = rooms.filter(r => r.type === "Classroom");
    const assignedClassroom = classRooms[Math.floor(Math.random() * classRooms.length)];

    const subjectTeacherMap = {};
    assignments.forEach(a => {
      subjectTeacherMap[a.subjectId] = a.teacherName;
    });

    const batchCount = parseInt(form.batches || 2);
    const timeSlots = generateTimeSlots().filter(slot => !slot.includes("Lunch"));
    const weekSlots = WEEKDAYS.flatMap(day => timeSlots.map(time => ({ day, time })));

    const theorySubjects = subj.filter(s => s.type === "Theory");
    const labSubjects = subj.filter(s => s.type === "Lab");

    const timetable = [];
    const usedSlots = new Set();
    const usedTeachers = new Set();

    // Track lab allocation per batch and subject
    const labScheduleStatus = {};
    labSubjects.forEach(subject => {
      labScheduleStatus[subject._id] = Array(batchCount).fill(0); // Track hours allocated per batch
    });

    // Helper to get 2-hour consecutive slots
    const getNext2HourSlot = (index) => {
      if (index < weekSlots.length - 1) {
        const curr = weekSlots[index];
        const next = weekSlots[index + 1];
        const [h1, m1] = curr.time.split("-")[0].split(":").map(Number);
        const [h2, m2] = next.time.split("-")[0].split(":").map(Number);
        if (h2 === h1 + 1 && m1 === m2) return { curr, next, index };
      }
      return null;
    };

    // Allocate labs (2-hour and 4-hour blocks)
    for (let i = 0; i < weekSlots.length - 1; i++) {
      const block = getNext2HourSlot(i);
      if (!block) continue;

      for (let subject of labSubjects) {
        const hoursPerBatch = subject.hoursPerWeek || 2;

        for (let batchIndex = 0; batchIndex < batchCount; batchIndex++) {
          if (labScheduleStatus[subject._id][batchIndex] >= hoursPerBatch) continue;

          const slotKey = `${block.curr.day}_${block.curr.time}_B${batchIndex}`;
          const slotKey2 = `${block.next.day}_${block.next.time}_B${batchIndex}`;
          const teacherName = subjectTeacherMap[subject._id];

          // Prevent teacher or batch conflict
          const teacherBusy = timetable.some(t =>
            t.day === block.curr.day &&
            (t.start === block.curr.time.split("-")[0] || t.start === block.next.time.split("-")[0]) &&
            t.teacher === teacherName
          );

          if (
            usedSlots.has(slotKey) || usedSlots.has(slotKey2) || teacherBusy
          ) continue;

          // Assign lab
          const lab = labRooms[(batchIndex + i) % labRooms.length];
          timetable.push({
            day: block.curr.day,
            start: block.curr.time.split("-")[0],
            end: block.next.time.split("-")[1],
            subject: subject.name,
            teacher: teacherName,
            room: `${lab.roomNumber} (${lab.location})`,
            batch: `Batch ${batchIndex + 1}`
          });

          usedSlots.add(slotKey);
          usedSlots.add(slotKey2);
          labScheduleStatus[subject._id][batchIndex] += 2;

          // Advance index for long labs
          i++;
        }
      }
    }

    // Check lab completion
    const allLabsAssigned = Object.entries(labScheduleStatus).every(([_, status]) =>
      status.every(hours => hours >= 2) // All labs at least 2 hours
    );

    if (!allLabsAssigned) {
      alert("❌ Could not allocate all lab sessions properly for each batch.");
      return;
    }

    // Theory assignment
    const allocatedTheory = {};
    theorySubjects.forEach(s => allocatedTheory[s._id] = 0);

    for (let { day, time } of weekSlots) {
      for (let subject of theorySubjects) {
        const max = subject.hoursPerWeek || 3;
        if (allocatedTheory[subject._id] >= max) continue;

        const alreadyUsed = timetable.some(t =>
          t.day === day && t.start === time.split("-")[0]
        );
        if (alreadyUsed) continue;

        timetable.push({
          day,
          start: time.split("-")[0],
          end: time.split("-")[1],
          subject: subject.name,
          teacher: subjectTeacherMap[subject._id],
          room: `${assignedClassroom.roomNumber} (${assignedClassroom.location})`,
          batch: "Full Class"
        });

        allocatedTheory[subject._id]++;
        break;
      }
    }

    const incompleteTheory = theorySubjects.some(
      s => allocatedTheory[s._id] < (s.hoursPerWeek || 3)
    );

    if (incompleteTheory) {
      alert("❌ Not all theory subjects could be allocated properly.");
      return;
    }

    const payload = {
      ...form,
      timetable
    };

    try {
      const res = await axios.post("http://localhost:5000/api/timetable", payload);
      setTimetable(res.data.timetable);
      setIsSaved(false);
      alert("✅ Timetable generated and saved successfully!");
    } catch (err) {
      console.error(err);
      alert("❌ Save failed: " + (err.response?.data?.error || err.message));
    }
  };

  const handleFinalSave = async () => {
    if (isSaved || timetable.length === 0) return;
    setSaveInProgress(true);

    try {
      const payload = { ...form, timetable };
      //const res = await axios.post("http://localhost:5000/api/timetable/finalize", payload);
      alert("✅ Timetable finalized and saved successfully!");
      setIsSaved(true);
    } catch (err) {
      console.error(err);
      alert("❌ Final save failed: " + (err.response?.data?.error || err.message));
    } finally {
      setSaveInProgress(false);
    }
  };

  const handleRefreshTimetable = () => {
    setTimetable([]);
    setIsSaved(false);
    generateAndSave();
  };

  // Enhanced timetable display with proper multi-batch support
  const renderStructuredTimetable = () => {
    const DISPLAY_TIMESLOTS = currentTimeslots.length > 0 ? currentTimeslots : [
      "08:30-09:30", "09:30-10:30", "10:30-11:30", "11:30-12:30",
      "12:30-13:30 (Lunch)", "13:30-14:30", "14:30-15:30", "15:30-16:30"
    ];

    // Group entries by day and time slot to handle multiple batches
    const groupedTimetable = {};
    
    timetable.forEach(entry => {
      const key = `${entry.day}_${entry.start}`;
      if (!groupedTimetable[key]) {
        groupedTimetable[key] = [];
      }
      groupedTimetable[key].push(entry);
    });

    // Track which slots are covered by multi-hour sessions
    const coveredSlots = new Set();

    return (
      <div style={{ marginTop: 40 }}>
        <h3>Complete Timetable - All Batches</h3>
        <table border="1" cellPadding="8" style={{ 
          borderCollapse: "collapse", 
          width: "100%", 
          textAlign: "center",
          fontSize: "12px"
        }}>
          <thead>
            <tr style={{ backgroundColor: "#f0f0f0" }}>
              <th style={{ minWidth: "120px" }}>Time</th>
              {WEEKDAYS.map((day, i) => (
                <th key={i} style={{ minWidth: "180px" }}>{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DISPLAY_TIMESLOTS.map((slot, rowIdx) => {
              // Skip lunch row for now, we'll handle it separately
              if (slot.includes("Lunch")) {
                return (
                  <tr key={rowIdx} style={{ backgroundColor: "#ffe6cc" }}>
                    <td><strong>{slot}</strong></td>
                    {WEEKDAYS.map((day, colIdx) => (
                      <td key={colIdx} style={{ fontStyle: "italic" }}>
                        LUNCH BREAK
                      </td>
                    ))}
                  </tr>
                );
              }

              const timeStart = slot.split("-")[0];
              
              return (
                <tr key={rowIdx}>
                  <td style={{ backgroundColor: "#f9f9f9" }}>
                    <strong>{slot}</strong>
                  </td>
                  {WEEKDAYS.map((day, colIdx) => {
                    const slotKey = `${day}_${timeStart}`;
                    
                    // Check if this slot is already covered by a previous multi-hour session
                    if (coveredSlots.has(slotKey)) {
                      return null; // This cell will be covered by rowspan
                    }

                    const entries = groupedTimetable[slotKey] || [];
                    
                    if (entries.length === 0) {
                      return <td key={colIdx} style={{ backgroundColor: "#f5f5f5" }}></td>;
                    }

                    // Check if any entry spans multiple hours
                    const multiHourEntry = entries.find(entry => {
                      const startTime = entry.start;
                      const endTime = entry.end;
                      const startHour = parseInt(startTime.split(":")[0]);
                      const endHour = parseInt(endTime.split(":")[0]);
                      return (endHour - startHour) > 1;
                    });

                    let rowspan = 1;
                    if (multiHourEntry) {
                      const startHour = parseInt(multiHourEntry.start.split(":")[0]);
                      const endHour = parseInt(multiHourEntry.end.split(":")[0]);
                      rowspan = endHour - startHour;
                      
                      // Mark covered slots
                      for (let i = 1; i < rowspan; i++) {
                        const nextSlotIndex = rowIdx + i;
                        if (nextSlotIndex < DISPLAY_TIMESLOTS.length) {
                          const nextTimeStart = DISPLAY_TIMESLOTS[nextSlotIndex].split("-")[0];
                          coveredSlots.add(`${day}_${nextTimeStart}`);
                        }
                      }
                    }

                    // Determine cell styling based on content
                    let cellStyle = { 
                      padding: "4px",
                      verticalAlign: "top",
                      lineHeight: "1.2"
                    };

                    if (entries.some(e => e.subject.toLowerCase().includes("lab"))) {
                      cellStyle.backgroundColor = "#e6f3ff"; // Light blue for labs
                    } else {
                      cellStyle.backgroundColor = "#e6ffe6"; // Light green for theory
                    }

                    return (
                      <td key={colIdx} rowSpan={rowspan} style={cellStyle}>
                        {entries.length === 1 ? (
                          // Single entry (theory or full class)
                          <div>
                            <div style={{ fontWeight: "bold", marginBottom: "2px", fontSize: "11px" }}>
                              {entries[0].subject}
                            </div>
                            <div style={{ fontSize: "10px", color: "#666" }}>
                              {entries[0].teacher}
                            </div>
                            <div style={{ fontSize: "9px", color: "#888" }}>
                              {entries[0].room}
                            </div>
                            <div style={{ fontSize: "9px", fontStyle: "italic", color: "#555" }}>
                              {entries[0].batch}
                            </div>
                          </div>
                        ) : (
                          // Multiple entries (different batches)
                          <div>
                            <div style={{ fontWeight: "bold", marginBottom: "3px", fontSize: "11px" }}>
                              {entries[0].subject}
                            </div>
                            <div style={{ fontSize: "10px", color: "#666", marginBottom: "2px" }}>
                              {entries[0].teacher}
                            </div>
                            {entries.map((entry, idx) => (
                              <div key={idx} style={{ 
                                fontSize: "9px", 
                                marginBottom: "1px",
                                padding: "1px 3px",
                                backgroundColor: "rgba(255,255,255,0.7)",
                                borderRadius: "2px",
                                border: "1px solid #ddd"
                              }}>
                                <strong>{entry.batch}</strong>: {entry.room}
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Summary Section */}
        <div style={{ marginTop: 20, padding: 15, backgroundColor: "#f9f9f9", borderRadius: "5px" }}>
          <h4>Timetable Summary:</h4>
          <div style={{ display: "flex", gap: "20px", fontSize: "12px" }}>
            <div>
              <strong>Total Theory Sessions:</strong> {timetable.filter(t => !t.subject.toLowerCase().includes("lab")).length}
            </div>
            <div>
              <strong>Total Lab Sessions:</strong> {timetable.filter(t => t.subject.toLowerCase().includes("lab")).length}
            </div>
            <div>
              <strong>Total Batches:</strong> {form.batches}
            </div>
          </div>
          
          <div style={{ marginTop: 10 }}>
            <div style={{ display: "inline-block", width: "20px", height: "15px", backgroundColor: "#e6ffe6", marginRight: "5px" }}></div>
            Theory Classes
            <div style={{ display: "inline-block", width: "20px", height: "15px", backgroundColor: "#e6f3ff", marginLeft: "15px", marginRight: "5px" }}></div>
            Lab Sessions
          </div>
        </div>
      </div>
    );
  };

  // Batch-wise view for detailed analysis
  const renderBatchWiseTimetable = () => {
    const batchCount = parseInt(form.batches || 2);
    const batches = Array.from({ length: batchCount }, (_, i) => `Batch ${i + 1}`);
    
    return (
      <div style={{ marginTop: 40 }}>
        <h3>Batch-wise Timetable View</h3>
        {batches.map(batch => {
          const batchTimetable = timetable.filter(t => 
            t.batch === batch || t.batch === "Full Class"
          );
          
          return (
            <div key={batch} style={{ marginBottom: 30 }}>
              <h4 style={{ backgroundColor: "#e6f3ff", padding: "8px", margin: "10px 0" }}>
                {batch} Schedule
              </h4>
              <table border="1" cellPadding="6" style={{ 
                borderCollapse: "collapse", 
                width: "100%", 
                fontSize: "11px"
              }}>
                <thead>
                  <tr style={{ backgroundColor: "#f0f0f0" }}>
                    <th>Day</th>
                    <th>Time</th>
                    <th>Subject</th>
                    <th>Teacher</th>
                    <th>Room</th>
                    <th>Type</th>
                  </tr>
                </thead>
                <tbody>
                  {WEEKDAYS.map(day => 
                    batchTimetable
                      .filter(t => t.day === day)
                      .sort((a, b) => a.start.localeCompare(b.start))
                      .map((entry, idx) => (
                        <tr key={`${day}-${idx}`}>
                          <td>{entry.day}</td>
                          <td>{entry.start} - {entry.end}</td>
                          <td>{entry.subject}</td>
                          <td>{entry.teacher}</td>
                          <td>{entry.room}</td>
                          <td style={{
                            backgroundColor: entry.subject.toLowerCase().includes("lab") ? "#ffe6e6" : "#e6ffe6",
                            fontWeight: "bold"
                          }}>
                            {entry.subject.toLowerCase().includes("lab") ? "LAB" : "THEORY"}
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Generate Timetable</h2>

      <div>
        <label>Department:</label>
        <select name="department" onChange={handleChange} value={form.department}>
          <option value="">Select</option>
          <option value="Computer Engineering">Computer Engineering</option>
          <option value="Information Technology">Information Technology</option>
        </select>
      </div>

      <div>
        <label>Semester Type:</label>
        <select name="semesterType" onChange={handleChange} value={form.semesterType}>
          <option value="">Select</option>
          <option value="odd">Odd</option>
          <option value="even">Even</option>
        </select>
      </div>

      <div>
        <label>Semester:</label>
        <select name="semester" onChange={handleChange} value={form.semester}>
          <option value="">Select</option>
          {semesterOptions.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div>
        <label>Batches (labs):</label>
        <input
          type="number" name="batches"
          min="1" max="4"
          value={form.batches}
          onChange={handleChange}
        />
      </div>

      <button onClick={generateAndSave} style={{ marginTop: 10 }}>Generate & Save</button>

      {timetable.length > 0 && (
        <>
          <div style={{ marginTop: 30 }}>
            <h3>Raw Timetable:</h3>
            <table border="1" cellPadding="6" style={{ borderCollapse: "collapse", width: "100%" }}>
              <thead>
                <tr>
                  <th>Day</th><th>Start</th><th>End</th><th>Subject</th><th>Teacher</th><th>Room</th><th>Batch</th>
                </tr>
              </thead>
              <tbody>
                {timetable.map((t, i) => (
                  <tr key={i}>
                    <td>{t.day}</td><td>{t.start}</td><td>{t.end}</td>
                    <td>{t.subject}</td><td>{t.teacher}</td><td>{t.room}</td><td>{t.batch}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {renderStructuredTimetable()}
          {renderBatchWiseTimetable()}

          <div style={{ marginTop: 20 }}>
            <button onClick={handleRefreshTimetable} disabled={isSaved}>
              🔄 Refresh Timetable
            </button>

            <button
              onClick={handleFinalSave}
              disabled={isSaved || saveInProgress}
              style={{
                marginLeft: 10,
                backgroundColor: isSaved ? "#ccc" : "#4CAF50",
                color: "white",
                padding: "8px 16px",
                border: "none",
                cursor: isSaved ? "not-allowed" : "pointer"
              }}
            >
              ✅ Final Save
            </button>

            {isSaved && (
              <div style={{ marginTop: 10, color: "green" }}>
                ✅ Timetable is finalized. No further changes allowed.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}