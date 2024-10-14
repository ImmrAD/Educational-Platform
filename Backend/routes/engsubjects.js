const express = require("express");
const router = express.Router();
const EngSubject = require("../models/engsubject"); // Assuming the schema is in models folder

// Existing GET route to fetch subjects
// router.get("/api/engsubjects", async (req, res) => {
//   try {
//     const subjects = await EngSubject.find();
//     res.json(subjects);
//   } catch (error) {
//     console.error("Error fetching subjects:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });
// Route to get a specific subject by ID
router.get("/api/engsubjects/:id", async (req, res) => {
  const { id } = req.params; // Get the ID from the URL parameters
  try {
    const subject = await EngSubject.findById(id); // Find the subject by ID
    if (!subject) {
      return res.status(404).json({ error: "Subject not found" }); // Return 404 if not found
    }
    res.json(subject); // Return the found subject
  } catch (error) {
    console.error("Error fetching subject:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// New POST route to create a subject
router.post("/api/engsubjects", async (req, res) => {
  const { title, sem, resources } = req.body; // Extract data from request body
  try {
    const newSubject = new EngSubject({ title, sem, resources }); // Create a new instance of the model
    await newSubject.save(); // Save it to the database
    res.status(201).json(newSubject); // Respond with the created subject
  } catch (error) {
    console.error("Error creating subject:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
