import React, { useState } from "react";
import TeacherManager from "./TeacherManager";
import RoomManager from "./RoomManager";
import SubjectManager from "./SubjectManager";
import GenerateTimetable from "./GenerateTimetable";
import TeacherSubjectManager from './TeacherSubjectManager';
import FacultyLoad from "./FacultyLoad"; 
import ClassroomLoadTable from "./ClassroomLoadTable";

function FormPage() {
  const [activeTab, setActiveTab] = useState("teachers");

  return (
    <div style={{ padding: 20 }}>
      <h1>Admin Dashboard</h1>

      <div style={{ marginBottom: 20 }}>
        <button onClick={() => setActiveTab("teachers")}>Manage Teachers</button>
        <button onClick={() => setActiveTab("rooms")}>Manage Rooms</button>
        <button onClick={() => setActiveTab("subjects")}>Manage Subjects</button>
        <button onClick={() => setActiveTab("Subject Allocation")}>Subject Allocation</button>
        <button onClick={() => setActiveTab("timetable")}>Generate Timetable</button>
        <button onClick={() => setActiveTab("facultyLoad")}>Faculty Load</button>
        <button onClick={() => setActiveTab("classroomLoad")}>Classroom Load</button>

      </div>

      <div>
        {activeTab === "teachers" && <TeacherManager />}
        {activeTab === "rooms" && <RoomManager />}
        {activeTab === "subjects" && <SubjectManager />}
        {activeTab === "Subject Allocation" && <TeacherSubjectManager />}
        {activeTab === "timetable" && <GenerateTimetable />}
        {activeTab === "facultyLoad" && <FacultyLoad />}
        {activeTab === "classroomLoad" && <ClassroomLoadTable />}

      </div>
    </div>
  );
}

export default FormPage;
