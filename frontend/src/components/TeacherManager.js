import React, { useState, useEffect } from "react";
import axios from "axios";

function TeacherManager() {
  const [form, setForm] = useState({
    name: "",
    teacherId: "",
    department: "",
    semesters: [],
  });
  const [oddEven, setOddEven] = useState("odd");
  const [teachers, setTeachers] = useState([]);
  const [editId, setEditId] = useState(null);

  const semesterOptions = oddEven === "odd" ? [1, 3, 5, 7] : [2, 4, 6, 8];

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    const res = await axios.get("http://localhost:5000/api/teachers");
    setTeachers(res.data);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSemesterChange = (sem) => {
    setForm((prev) => {
      const semesters = prev.semesters.includes(sem)
        ? prev.semesters.filter((s) => s !== sem)
        : [...prev.semesters, sem];
      return { ...prev, semesters };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editId) {
      await axios.put(`http://localhost:5000/api/teachers/${editId}`, form);
      setEditId(null);
    } else {
      await axios.post("http://localhost:5000/api/teachers", form);
    }
    setForm({ name: "", teacherId: "", department: "", semesters: [] });
    fetchTeachers();
  };

  const handleDelete = async (id) => {
    await axios.delete(`http://localhost:5000/api/teachers/${id}`);
    fetchTeachers();
  };

  const handleEdit = (teacher) => {
    setForm({
      name: teacher.name,
      teacherId: teacher.teacherId,
      department: teacher.department,
      semesters: teacher.semesters,
    });
    setEditId(teacher._id);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>{editId ? "Edit" : "Add"} Teacher</h2>
      <form onSubmit={handleSubmit}>
        <input name="name" value={form.name} onChange={handleChange} placeholder="Name" required />
        <input name="teacherId" value={form.teacherId} onChange={handleChange} placeholder="ID" required />
        <select name="department" value={form.department} onChange={handleChange} required>
          <option value="">Select Department</option>
          <option value="Computer Engineering">Computer Engineering</option>
          <option value="Information Technology">Information Technology</option>
        </select>
        <div>
          <label>Semester Type: </label>
          <select onChange={(e) => setOddEven(e.target.value)} value={oddEven}>
            <option value="odd">Odd</option>
            <option value="even">Even</option>
          </select>
        </div>
        <div>
          {semesterOptions.map((sem) => (
            <label key={sem} style={{ marginRight: 10 }}>
              <input
                type="checkbox"
                checked={form.semesters.includes(sem)}
                onChange={() => handleSemesterChange(sem)}
              />
              {sem}
            </label>
          ))}
        </div>
        <button type="submit">{editId ? "Update" : "Add"} Teacher</button>
        {editId && (
          <button
            type="button"
            onClick={() => {
              setEditId(null);
              setForm({ name: "", teacherId: "", department: "", semesters: [] });
            }}
            style={{ marginLeft: "10px" }}
          >
            Cancel
          </button>
        )}
      </form>

      <h3>Teachers List</h3>
      <ul>
        {teachers.map((t) => (
          <li key={t._id}>
            {t.name} ({t.teacherId}) - {t.department} - Semesters: {t.semesters.join(", ")}
            <button onClick={() => handleEdit(t)} style={{ marginLeft: 10 }}>Edit</button>
            <button onClick={() => handleDelete(t._id)} style={{ marginLeft: 5 }}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TeacherManager;
