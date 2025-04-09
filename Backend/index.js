const cors = require("cors");
const express = require("express");
const { initializeSubjectVisibility } = require('./utils/initSubjectVisibility');
const { z } = require('zod'); // Use Zod for schema validation
const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require('crypto');
const errorHandler = require('./middleware/errorHandler');
require('dotenv').config();
const EngSubject = require('./models/engsubject'); // Adjust path accordingly
const engsubjectsRouter = require('./routes/engsubjects');
const filesRouter = require('./routes/files');
const subjectsRouter = require('./routes/subjects');
const subjectVisibilityRouter = require('./routes/subjectVisibility');
const Subject = require('./models/subject');
const File = require('./models/file'); // Add File model import
const usersRouter = require('./routes/users');
const analyticsRouter = require('./routes/analytics');

const app = express();

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  process.env.FRONTEND_URL
].filter(Boolean); // Remove any undefined/null values

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // to parse URL-encoded bodies

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

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://ananddane1:yWCAi9RxEZz9wIEY@cluster0.kwtobog.mongodb.net/educate';

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log("MongoDB is connected!");
    try {
      await initializeSubjectVisibility();
      console.log('Subject visibility initialized');
    } catch (error) {
      console.error('Error initializing subject visibility:', error);
    }
  })
  .catch((err) => {
    console.error("MongoDB connection error: ", err);
    process.exit(1);
  });

// Register all routes with consistent API prefix
app.use('/api', engsubjectsRouter);
app.use('/api', filesRouter);
app.use('/api', subjectsRouter);
app.use('/api/visibility', subjectVisibilityRouter);
app.use('/api/users', usersRouter);
app.use('/api/analytics', analyticsRouter);

// Contact route
app.post('/api/contact', async (req, res) => {
    const { message, isSuggestion } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    let transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    try {
        let mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.ADMIN_EMAIL || 'otptrails@gmail.com',
            subject: 'New Contact Message',
            text: `
                New message received:

                Message: ${message}

                ${isSuggestion ? 'This message is categorized as a suggestion.' : 'This message is not a suggestion.'}
            `
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Message sent successfully!' });
    } catch (error) {
        console.error("Email sending error: ", error);
        res.status(500).json({ error: 'Failed to send message' });
    }
});

// Subject routes
app.post("/api/subject", async (req, res) => {
    const createPayload = req.body;
    const parsedPayload = subjectSchema.safeParse(createPayload);

    if (!parsedPayload.success) {
        return res.status(400).json({
            msg: "You sent wrong inputs",
            errors: parsedPayload.error.errors
        });
    }

    // Assuming user is logged in; this is just a placeholder for author.
    const user = { email: "test@example.com" };

    const newSubject = await Subject.create({
        title: createPayload.title,
        description: createPayload.description,
        author: user.email,  // In real app, this should come from the logged-in user
        resources: createPayload.resources || []  // Default to an empty array if no resources
    });

    res.json({
        msg: "Subject Created!",
        subject: newSubject
    });
});

app.get("/api/subjects", async (req, res) => {
    try {
        const subjects = await Subject.find();  // Fetch all subjects from MongoDB
        res.json({ subjects });  // Return subjects as JSON response
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

app.put("/api/subjects/:id", async (req, res) => {
    const { id } = req.params;
    const updatePayload = req.body;

    // Validate payload using Zod
    const parsedPayload = subjectSchema.safeParse(updatePayload);
    if (!parsedPayload.success) {
        return res.status(400).json({
            msg: "Invalid inputs",
            errors: parsedPayload.error.errors
        });
    }

    try {
        const updatedSubject = await Subject.findByIdAndUpdate(id, updatePayload, { new: true });
        if (!updatedSubject) {
            return res.status(404).json({ message: "Subject not found" });
        }
        res.json({
            msg: "Subject updated successfully",
            subject: updatedSubject
        });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

app.get("/api/subjects/:id", async (req, res) => {
    try {
        const subject = await Subject.findById(req.params.id);
        if (!subject) {
            return res.status(404).json({ message: "Subject not found" });
        }
        res.json({ subject });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

app.post('/api/engsubject', async (req, res) => {
    try {
        const newSubject = new EngSubject(req.body);
        const savedSubject = await newSubject.save();
        res.status(201).send(savedSubject);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

app.get('/api/engsubjects', async (req, res) => {
    const { sem } = req.query; // Get the sem from the query parameters

    try {
        // Fetch subjects based on the semester
        const subjects = sem ? await EngSubject.find({ sem }) : await EngSubject.find();
        res.json(subjects);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Error handling middleware
app.use(errorHandler);

// Handle 404 routes
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

