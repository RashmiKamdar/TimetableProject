const express = require("express");
const router = express.Router();
const {
  addTeacher,
  getTeachers,
  updateTeacher,
  deleteTeacher,
} = require("../controllers/teacherController");

router.route("/").get(getTeachers).post(addTeacher);
router.route("/:id").put(updateTeacher).delete(deleteTeacher);

module.exports = router;
