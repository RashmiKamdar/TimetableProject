const express = require('express');
const router = express.Router();
const Subject = require('../models/Subject');

// GET all subjects
router.get('/', async (req, res) => {
  const subjects = await Subject.find();
  res.json(subjects);
});

// POST new subject
router.post('/', async (req, res) => {
  const subject = new Subject(req.body);
  await subject.save();
  res.status(201).json(subject);
});

// PUT update subject
router.put('/:id', async (req, res) => {
  const updated = await Subject.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

// DELETE subject
router.delete('/:id', async (req, res) => {
  await Subject.findByIdAndDelete(req.params.id);
  res.json({ message: 'Subject deleted' });
});

module.exports = router;
