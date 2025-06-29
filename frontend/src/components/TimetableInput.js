import React, { useState } from "react";

function TimetableInput({ setDept, setSem, setBatches }) {
  const [department, setDepartment] = useState("");
  const [semesterType, setSemesterType] = useState("");
  const [semester, setSemester] = useState("");
  const [batchCount, setBatchCount] = useState(2);

  const handleSubmit = (e) => {
    e.preventDefault();
    setDept(department);
    setSem(semester);
    setBatches(batchCount);
    alert("Inputs saved. Switch to 'View Timetable' tab to generate the timetable.");
  };

  const getSemesterOptions = () => {
    if (semesterType === "odd") return [1, 3, 5, 7];
    if (semesterType === "even") return [2, 4, 6, 8];
    return [];
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 400 }}>
      <h2>Timetable Generation Input</h2>

      <label>Department:</label>
      <select value={department} onChange={(e) => setDepartment(e.target.value)} required>
        <option value="">Select Department</option>
        <option value="Computer">Computer Engineering</option>
        <option value="IT">Information Technology</option>
      </select>

      <br /><br />

      <label>Semester Type:</label>
      <select value={semesterType} onChange={(e) => setSemesterType(e.target.value)} required>
        <option value="">Select Type</option>
        <option value="odd">Odd</option>
        <option value="even">Even</option>
      </select>

      <br /><br />

      <label>Semester:</label>
      <select value={semester} onChange={(e) => setSemester(e.target.value)} required>
        <option value="">Select Semester</option>
        {getSemesterOptions().map((sem) => (
          <option key={sem} value={sem}>{sem}</option>
        ))}
      </select>

      <br /><br />

      <label>Number of Batches (for labs):</label>
      <input
        type="number"
        min="1"
        max="4"
        value={batchCount}
        onChange={(e) => setBatchCount(Number(e.target.value))}
        required
      />

      <br /><br />

      <button type="submit">Save & Generate Timetable</button>
    </form>
  );
}

export default TimetableInput;
