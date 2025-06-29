import React, { useState, useEffect } from "react";
import axios from "axios";

function SubjectManager() {
  const [form, setForm] = useState({
    name: "",
    department: "Computer Engineering",
    semesterType: "odd",
    semester: "",
    credits: 0,
    hoursPerWeek: 0,
    type: "Theory",
  });

  const [subjects, setSubjects] = useState([]);
  const [editId, setEditId] = useState(null);

  const semesterOptions = form.semesterType === "odd" ? [1, 3, 5, 7] : [2, 4, 6, 8];

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    const res = await axios.get("http://localhost:5000/api/subjects");
    setSubjects(res.data);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editId) {
      await axios.put(`http://localhost:5000/api/subjects/${editId}`, form);
      setEditId(null);
    } else {
      await axios.post("http://localhost:5000/api/subjects", form);
    }
    setForm({
      name: "",
      department: "Computer Engineering",
      semesterType: "odd",
      semester: "",
      credits: 0,
      hoursPerWeek: 0,
      type: "Theory",
    });
    fetchSubjects();
  };

  const handleEdit = (subject) => {
    setForm(subject);
    setEditId(subject._id);
  };

  const handleDelete = async (id) => {
    await axios.delete(`http://localhost:5000/api/subjects/${id}`);
    fetchSubjects();
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Manage Subjects</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Enter subject name"
          value={form.name}
          onChange={handleChange}
          required
        />
        <br />
        <label>Department</label>
        <select name="department" value={form.department} onChange={handleChange}>
          <option value="Computer Engineering">Computer Engineering</option>
          <option value="Information Technology">Information Technology</option>
        </select>
        <br />
        <label>Semester Type</label>
        <select name="semesterType" value={form.semesterType} onChange={handleChange}>
          <option value="odd">Odd</option>
          <option value="even">Even</option>
        </select>
        <br />
        <label>Semester</label>
        <select name="semester" value={form.semester} onChange={handleChange} required>
          <option value="">Select Semester</option>
          {semesterOptions.map((sem) => (
            <option key={sem} value={sem}>{sem}</option>
          ))}
        </select>
        <br />
        <label>Credits</label>
        <input
          type="number"
          name="credits"
          value={form.credits}
          onChange={handleChange}
          min="0"
        />
        <br />
        <label>Hours per Week</label>
        <input
          type="number"
          name="hoursPerWeek"
          value={form.hoursPerWeek}
          onChange={handleChange}
          min="0"
        />
        <br />
        <label>Type</label>
        <select name="type" value={form.type} onChange={handleChange}>
          <option value="Theory">Theory</option>
          <option value="Lab">Lab</option>
          <option value="Tutorial">Tutorial</option>
        </select>
        <br />
        <button type="submit">{editId ? "Update" : "Add"} Subject</button>
        {editId && (
          <button
            type="button"
            onClick={() => {
              setEditId(null);
              setForm({
                name: "",
                department: "Computer Engineering",
                semesterType: "odd",
                semester: "",
                credits: 0,
                hoursPerWeek: 0,
                type: "Theory",
              });
            }}
          >
            Cancel
          </button>
        )}
      </form>

      <h3>Subjects List</h3>
      <table border="1" cellPadding="5">
        <thead>
          <tr>
            <th>Name</th>
            <th>Department</th>
            <th>Semester Type</th>
            <th>Semester</th>
            <th>Credits</th>
            <th>Hours</th>
            <th>Type</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {subjects.map((s) => (
            <tr key={s._id}>
              <td>{s.name}</td>
              <td>{s.department}</td>
              <td>{s.semesterType}</td>
              <td>{s.semester}</td>
              <td>{s.credits}</td>
              <td>{s.hoursPerWeek}</td>
              <td>{s.type}</td>
              <td>
                <button onClick={() => handleEdit(s)}>Edit</button>
                <button onClick={() => handleDelete(s._id)} style={{ marginLeft: 5 }}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default SubjectManager;
