import express from "express";
import Assignment from "../models/Assignment.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Get all assignments for the logged-in user
router.get("/", auth, async (req, res) => {
  try {
    const assignments = await Assignment.find({ userId: req.user._id });
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new assignment
router.post("/", auth, async (req, res) => {
  try {
    const assignment = new Assignment({
      ...req.body,
      userId: req.user._id
    });
    await assignment.save();
    res.status(201).json(assignment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update an assignment
router.put("/:id", auth, async (req, res) => {
  try {
    const assignment = await Assignment.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    Object.assign(assignment, req.body);
    await assignment.save();
    res.json(assignment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete an assignment
router.delete("/:id", auth, async (req, res) => {
  try {
    const assignment = await Assignment.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    res.json({ message: "Assignment deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
