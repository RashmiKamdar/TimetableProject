// src/components/TeacherSubjectManager.js
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

function TeacherSubjectManager() {
  const [department, setDepartment] = useState('Computer Engineering');
  const [semesterType, setSemesterType] = useState('odd');
  const [semester, setSemester] = useState('');
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [assignments, setAssignments] = useState([]);

  const [form, setForm] = useState({
    teacherId: '',
    subjectId: ''
  });
  const [editId, setEditId] = useState(null);

  const semesterOptions = semesterType === 'odd' ? [1,3,5,7] : [2,4,6,8];

  const fetchTeachersAndSubjects = useCallback(async () => {
    if (!semester) return;

    try {
      const tRes = await axios.get('http://localhost:5000/api/teachers');
      const sRes = await axios.get('http://localhost:5000/api/subjects');

      const deptTeachers = tRes.data.filter(t =>
        t.department === department && t.semesters.includes(parseInt(semester))
      );
      const deptSubjects = sRes.data.filter(s =>
        s.department === department && s.semester === parseInt(semester)
      );

      setTeachers(deptTeachers);
      setSubjects(deptSubjects);
    } catch (err) {
      console.error('Error loading filtered data', err);
    }
  }, [department, semester]);

  useEffect(() => {
    fetchTeachersAndSubjects();
  }, [fetchTeachersAndSubjects]);

  const fetchAssignments = async () => {
    const res = await axios.get('http://localhost:5000/api/assignments');
    setAssignments(res.data);
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const payload = { ...form, department, semesterType, semester: parseInt(semester) };

    if (editId) {
      await axios.put(`http://localhost:5000/api/assignments/${editId}`, payload);
      setEditId(null);
    } else {
      await axios.post('http://localhost:5000/api/assignments', payload);
    }
    setForm({ teacherId: '', subjectId: '' });
    fetchAssignments();
  };

  const handleEdit = a => {
    setForm({ teacherId: a.teacherId, subjectId: a.subjectId });
    setDepartment(a.department);
    setSemesterType(a.semesterType);
    setSemester(a.semester.toString());
    setEditId(a._id);
  };

  const handleDelete = async id => {
    await axios.delete(`http://localhost:5000/api/assignments/${id}`);
    fetchAssignments();
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Assign Subjects to Teachers</h2>

      {/* Filters */}
      <div>
        <label>Department:</label>
        <select value={department} onChange={e => setDepartment(e.target.value)}>
          <option value="Computer Engineering">Computer Engineering</option>
          <option value="Information Technology">Information Technology</option>
        </select>

        <label style={{ marginLeft: 20 }}>Semester Type:</label>
        <select value={semesterType} onChange={e => setSemesterType(e.target.value)}>
          <option value="odd">Odd</option>
          <option value="even">Even</option>
        </select>

        <label style={{ marginLeft: 20 }}>Semester:</label>
        <select value={semester} onChange={e => setSemester(e.target.value)}>
          <option value="">Select Semester</option>
          {semesterOptions.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Assignment Form */}
      <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>
        <label>Teacher:</label>
        <select name="teacherId" value={form.teacherId} onChange={handleChange} required>
          <option value="">Select Teacher</option>
          {teachers.map(t => (
            <option key={t._id} value={t._id}>{t.name}</option>
          ))}
        </select>

        <label style={{ marginLeft: 20 }}>Subject:</label>
        <select name="subjectId" value={form.subjectId} onChange={handleChange} required>
          <option value="">Select Subject</option>
          {subjects.map(s => (
            <option key={s._id} value={s._id}>{s.name}</option>
          ))}
        </select>

        <button type="submit" style={{ marginLeft: 20 }}>
          {editId ? 'Update Assignment' : 'Assign Subject'}
        </button>
        {editId && (
          <button
            type="button"
            onClick={() => {
              setEditId(null);
              setForm({ teacherId: '', subjectId: '' });
            }}
            style={{ marginLeft: 10 }}
          >
            Cancel
          </button>
        )}
      </form>

      {/* Mappings Display */}
      <h3 style={{ marginTop: 30 }}>Assigned Subjects</h3>
<table border="1" cellPadding="5">
  <thead>
    <tr>
      <th>Teacher</th>
      <th>Subject</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    {assignments.map(a => (
      <tr key={a._id}>
        <td>{a.teacherName}</td>
        <td>{a.subjectName}</td>
        <td>
          <button onClick={() => handleEdit(a)}>Edit</button>
          <button onClick={() => handleDelete(a._id)} style={{ marginLeft: 5 }}>Delete</button>
        </td>
      </tr>
    ))}
  </tbody>
</table>

    </div>
  );
}

export default TeacherSubjectManager;
