import React, { useState, useEffect } from "react";
import axios from "axios";

function RoomManager() {
  const [roomForm, setRoomForm] = useState({ roomNumber: "", location: "", type: "Classroom" });
  const [rooms, setRooms] = useState([]);
  const [editRoomId, setEditRoomId] = useState(null);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    const res = await axios.get("http://localhost:5000/api/rooms");
    setRooms(res.data);
  };

  const handleRoomChange = (e) => {
    const { name, value } = e.target;
    setRoomForm({ ...roomForm, [name]: value });
  };

  const handleRoomSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editRoomId) {
        await axios.put(`http://localhost:5000/api/rooms/${editRoomId}`, roomForm);
        setEditRoomId(null);
      } else {
        await axios.post("http://localhost:5000/api/rooms", roomForm);
      }
      setRoomForm({ roomNumber: "", location: "", type: "Classroom" });
      fetchRooms();
    } catch (err) {
      alert(err?.response?.data?.message || "Error saving room.");
    }
  };

  const handleEditRoom = (room) => {
    setRoomForm({ roomNumber: room.roomNumber, location: room.location, type: room.type });
    setEditRoomId(room._id);
  };

  const handleDeleteRoom = async (id) => {
    await axios.delete(`http://localhost:5000/api/rooms/${id}`);
    fetchRooms();
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Manage Classrooms / Labs</h2>
      <form onSubmit={handleRoomSubmit}>
        <input
          name="roomNumber"
          value={roomForm.roomNumber}
          onChange={handleRoomChange}
          placeholder="Room/Lab Number"
          required
        />
        <input
          name="location"
          value={roomForm.location}
          onChange={handleRoomChange}
          placeholder="Location"
          required
        />
        <select name="type" value={roomForm.type} onChange={handleRoomChange} required>
          <option value="Classroom">Classroom</option>
          <option value="Lab">Lab</option>
        </select>
        <button type="submit">{editRoomId ? "Update" : "Add"} Room</button>
        {editRoomId && (
          <button
            type="button"
            onClick={() => {
              setEditRoomId(null);
              setRoomForm({ roomNumber: "", location: "", type: "Classroom" });
            }}
            style={{ marginLeft: "10px" }}
          >
            Cancel
          </button>
        )}
      </form>

      <br />
      <h3>Existing Classrooms / Labs</h3>
      <select
        onChange={(e) => {
          const selected = rooms.find((r) => r._id === e.target.value);
          if (selected) handleEditRoom(selected);
        }}
      >
        <option value="">Select Room to Edit</option>
        {rooms.map((r) => (
          <option key={r._id} value={r._id}>
            {r.roomNumber} - {r.location} ({r.type})
          </option>
        ))}
      </select>

      <ul>
        {rooms.map((r) => (
          <li key={r._id}>
            {r.roomNumber} - {r.location} ({r.type})
            <button onClick={() => handleEditRoom(r)} style={{ marginLeft: 10 }}>
              Edit
            </button>
            <button onClick={() => handleDeleteRoom(r._id)} style={{ marginLeft: 5 }}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default RoomManager;
