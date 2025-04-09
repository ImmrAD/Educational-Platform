const express = require("express");
const router = express.Router();
const EngSubject = require("../models/engsubject");
const jwt = require('jsonwebtoken');

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

// Role-based authorization middleware
const authorizeRole = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Access forbidden: Insufficient permissions' });
        }
        next();
    };
};

// GET route to fetch all subjects
router.get("/api/engsubjects", authenticateToken, async (req, res) => {
  try {
    const { sem } = req.query;
    const query = sem ? { sem } : {};
    const subjects = await EngSubject.find(query);
    res.json(subjects);
  } catch (error) {
    console.error("Error fetching subjects:", error);
    const errorMessage = error.name === 'ValidationError' ? 'Invalid subject data' : 'Internal server error';
    res.status(500).json({ error: errorMessage, details: error.message });
  }
});

// Route to get a specific subject by ID
router.get("/api/engsubjects/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const subject = await EngSubject.findById(id);
    if (!subject) {
      return res.status(404).json({ error: "Subject not found" });
    }
    res.json(subject);
  } catch (error) {
    console.error("Error fetching subject:", error);
    const errorMessage = error.name === 'CastError' ? 'Invalid subject ID format' : 'Internal server error';
    res.status(500).json({ error: errorMessage, details: error.message });
  }
});

// POST route to create a subject
router.post("/api/engsubjects", authenticateToken, authorizeRole(['teacher', 'admin']), async (req, res) => {
  const { title, sem, resources } = req.body;
  try {
    const newSubject = new EngSubject({ title, sem, resources });
    await newSubject.save();
    res.status(201).json(newSubject);
  } catch (error) {
    console.error("Error creating subject:", error);
    const errorMessage = error.name === 'ValidationError' ? 'Invalid subject data' : 'Internal server error';
    res.status(500).json({ error: errorMessage, details: error.message });
  }
});

// PUT route to update a subject
router.put("/api/engsubjects/:id", authenticateToken, authorizeRole(['teacher', 'admin']), async (req, res) => {
  const { id } = req.params;
  const { title, sem, resources } = req.body;
  try {
    const updatedSubject = await EngSubject.findByIdAndUpdate(
      id,
      { title, sem, resources },
      { new: true, runValidators: true }
    );
    if (!updatedSubject) {
      return res.status(404).json({ error: "Subject not found" });
    }
    res.json(updatedSubject);
  } catch (error) {
    console.error("Error updating subject:", error);
    const errorMessage = error.name === 'ValidationError' ? 'Invalid subject data' : error.name === 'CastError' ? 'Invalid subject ID format' : 'Internal server error';
    res.status(500).json({ error: errorMessage, details: error.message });
  }
});

// DELETE route to remove a subject
router.delete("/api/engsubjects/:id", authenticateToken, authorizeRole(['teacher', 'admin']), async (req, res) => {
  const { id } = req.params;
  try {
    const deletedSubject = await EngSubject.findByIdAndDelete(id);
    if (!deletedSubject) {
      return res.status(404).json({ error: "Subject not found" });
    }
    res.json({ message: "Subject deleted successfully" });
  } catch (error) {
    console.error("Error deleting subject:", error);
    const errorMessage = error.name === 'CastError' ? 'Invalid subject ID format' : 'Internal server error';
    res.status(500).json({ error: errorMessage, details: error.message });
  }
});

module.exports = router;
