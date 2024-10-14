const cors = require("cors");
const express = require("express");
const { z } = require('zod'); // Use Zod for schema validation
const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require('crypto');
require('dotenv').config();
const EngSubject = require('./models/engsubject'); // Adjust path accordingly
const engsubjectsRoute = require('./routes/engsubjects'); // Import the route


const app = express();

// MongoDB connection
mongoose.connect('mongodb+srv://ananddane1:yWCAi9RxEZz9wIEY@cluster0.kwtobog.mongodb.net/mydatabase')
  .then(() => console.log("MongoDB is connected!"))
  .catch((err) => console.error("MongoDB connection error: ", err));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // to parse URL-encoded bodies

// Import the user model
const User = require('./models/user');

// Helper to send OTP via email
const sendOtpEmail = async (email, otp) => {
    let transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.EMAIL_USER, // Your email
            pass: process.env.EMAIL_PASS  // Your email password
        }
    });

    let info = await transporter.sendMail({
        from: '"Educate" <otp.trails@gmail.com>',
        to: email,
        subject: "Your OTP Code",
        text: `Your OTP code is ${otp}. It will expire in 10 minutes.`
    });

    console.log("OTP email sent: ", info.response);
};

// Signup Route with OTP Generation
app.post("/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Validate input
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate OTP
        const otp = crypto.randomInt(100000, 999999).toString();
        const otpExpiresAt = new Date(Date.now() + 10 * 60000); // 10 minutes

        // Create new user
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            otp,
            otpExpiresAt
        });

        await newUser.save();

        // Send OTP
        await sendOtpEmail(email, otp);

        res.status(201).json({
            message: 'User registered successfully. OTP sent to email.',
            userId: newUser._id
        });
    } catch (error) {
        console.error("Signup Error: ", error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// OTP Verification Route
app.post("/verify-otp", async (req, res) => {
    const { userId, otp } = req.body;

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        // Check if OTP matches and is still valid
        if (user.otp !== otp || user.otpExpiresAt < Date.now()) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        // Mark user as verified
        user.isVerified = true;
        user.otp = undefined; // Clear OTP
        user.otpExpiresAt = undefined; // Clear OTP expiry time
        await user.save();

        res.status(200).json({ message: "OTP verified successfully. You can now log in." });
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
});

// Login Route
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        // Check if the user is verified
        if (!user.isVerified) {
            return res.status(403).json({ message: "Please verify your email before logging in." });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Generate token and send response
        const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ message: "Login successful", token });
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
});
//Import the subject model
const Subject = require('./models/subject');




app.use(cors({
    origin: "http://localhost:5173" // Ensure this matches the frontend URL
}));



// Schema for validating subject inputs, including resources
const subjectSchema = z.object({
    title: z.string(),
    description: z.string(),
    resources: z.array(
        z.object({
            title: z.string(),
            type: z.enum(["youtube", "pdf", "link"]),
            link: z.string().url(),
        })
    ).optional() // resources field is optional
});

// Use the engsubjects routes
app.use(engsubjectsRoute); // This makes your route available

// Add new subject title and description
app.post("/subject", async (req, res) => {
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

app.get("/subjects", async (req, res) => {
    try {
        const subjects = await Subject.find();  // Fetch all subjects from MongoDB
        res.json({ subjects });  // Return subjects as JSON response
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});


// Contact Route
app.post('/contact', async (req, res) => {
    const { message, isSuggestion } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    let transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.EMAIL_USER, // Your email
            pass: process.env.EMAIL_PASS  // Your email password
        }
    });

    try {
        let mailOptions = {
            from: process.env.EMAIL_USER, // Sender address
            to: 'otptrails@gmail.com', // Owner's email
            subject: 'New Contact Message',
            text: `
                New message received:

                Message: ${message}

                ${isSuggestion ? 'This message is categorized as a suggestion.' : 'This message is not a suggestion.'}
            ` // Message body formatted with suggestion information
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Message sent successfully!' });
    } catch (error) {
        console.error("Email sending error: ", error);
        res.status(500).json({ error: 'Failed to send message' });
    }
});

app.put("/subjects/:id", async (req, res) => {
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

app.get("/subjects/:id", async (req, res) => {
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

app.post('/engsubject', async (req, res) => {
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
  

app.listen(3001, () => {
    console.log("server is running on port 3001");
});

