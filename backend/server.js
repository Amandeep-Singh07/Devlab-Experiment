// Load environment variables from the .env file
require('dotenv').config();

// Import required dependencies
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Initialize the Express application
const app = express();

// Enable Cross-Origin Resource Sharing (CORS) to allow requests from the frontend
app.use(cors());

// Middleware to parse incoming JSON payloads in requests
app.use(express.json());

// ==========================================
// MONGODB CONNECTION
// ==========================================
// Establish a connection to the MongoDB database using the connection string from environment variables
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// ==========================================
// MODELS
// ==========================================

// Define the User schema
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Passwords will be hashed before saving
}, { timestamps: true });

// Compile the User schema into a model
const User = mongoose.model('User', userSchema);

// Define the Experiment schema
const experimentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to the user who created it
    title: { type: String, required: true },
    technology: { type: String, required: true },
    difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
    tags: [{ type: String }],
    timeTaken: { type: String },
    views: { type: Number, default: 0 },
    upvotes: { type: Number, default: 0 },
    setupSteps: { type: String },
    observations: { type: String },
    errorsFaced: { type: String },
    solutionsDiscovered: { type: String }
}, { timestamps: true });

// Create a text index on specific text fields to allow for powerful text-based searches
experimentSchema.index({ title: 'text', errorsFaced: 'text', solutionsDiscovered: 'text', tags: 'text' });

// Compile the Experiment schema into a model
const Experiment = mongoose.model('Experiment', experimentSchema);

// ==========================================
// MIDDLEWARE
// ==========================================

// Authentication middleware to protect private routes
const authenticate = (req, res, next) => {
    // Extract the token from the "Authorization: Bearer <token>" header
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    try {
        // Verify the token using the secret key
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Attach the decoded user data (like user ID) to the request object
        req.user = decoded;
        next(); // Proceed to the next middleware or route handler
    } catch (err) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

// ==========================================
// ROUTES
// ==========================================

// Basic health check route
app.get('/', (req, res) => res.send('DevLab API is running'));

// --- AUTHENTICATION ROUTES ---

// Handle user registration
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        // Check if user already exists in the database
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'User already exists' });

        // Hash the password for security
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create and save the new user
        const user = new User({ name, email, password: hashedPassword });
        await user.save();
        
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Handle user login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        // Compare the provided password with the hashed password in the database
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        // Generate a JSON Web Token valid for 1 day
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        
        // Return the token and basic user info to the client
        res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// --- EXPERIMENT ROUTES ---

// Get all experiments for the currently logged-in user, with support for searching and filtering
app.get('/api/experiments', authenticate, async (req, res) => {
    try {
        const query = { user: req.user.id };
        const { technology, difficulty, tags, sort, q } = req.query;

        // If a search query is provided, use MongoDB's text search
        if (q) query.$text = { $search: q };
        
        // Apply filters if they exist in the query string
        if (technology) query.technology = technology;
        if (difficulty) query.difficulty = difficulty;
        if (tags) {
            // Split comma-separated tags into an array and filter out empty strings
            const tagsArray = tags.split(',').map(tag => tag.trim()).filter(Boolean);
            if (tagsArray.length > 0) {
                // Find documents that contain ALL the provided tags
                query.tags = { $all: tagsArray };
            }
        }

        // Determine sorting logic based on the user's selection
        let sortOption = { createdAt: -1 }; // default to newest first
        if (sort === 'mostViewed') sortOption = { views: -1 };
        if (sort === 'mostUseful') sortOption = { upvotes: -1 };

        // Execute the database query with sorting applied
        const experiments = await Experiment.find(query).sort(sortOption);
        res.json(experiments);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// A dedicated route for basic text search (kept for backwards compatibility or alternative usages)
app.get('/api/search', authenticate, async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.json([]);
        
        // Execute a text search against the defined index
        const experiments = await Experiment.find({
            user: req.user.id,
            $text: { $search: q }
        });
        res.json(experiments);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get details for a specific experiment and increment its view count
app.get('/api/experiments/:id', authenticate, async (req, res) => {
    try {
        // Find the experiment by ID and simultaneously increment the "views" field by 1
        const experiment = await Experiment.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            { $inc: { views: 1 } },
            { new: true } // Return the updated document rather than the original
        );
        if (!experiment) return res.status(404).json({ message: 'Experiment not found' });
        res.json(experiment);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Increment the upvote count for a specific experiment
app.post('/api/experiments/:id/upvote', authenticate, async (req, res) => {
    try {
        // Find the experiment and increment the "upvotes" field by 1
        const experiment = await Experiment.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            { $inc: { upvotes: 1 } },
            { new: true }
        );
        if (!experiment) return res.status(404).json({ message: 'Experiment not found' });
        res.json(experiment);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Create a new experiment
app.post('/api/experiments', authenticate, async (req, res) => {
    try {
        // Attach the ID of the authenticated user to the experiment payload
        const experiment = new Experiment({ ...req.body, user: req.user.id });
        await experiment.save();
        res.status(201).json(experiment);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update an existing experiment
app.put('/api/experiments/:id', authenticate, async (req, res) => {
    try {
        // Find the experiment by ID and update it with the new data from req.body
        const experiment = await Experiment.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            req.body,
            { new: true }
        );
        if (!experiment) return res.status(404).json({ message: 'Experiment not found' });
        res.json(experiment);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete an experiment
app.delete('/api/experiments/:id', authenticate, async (req, res) => {
    try {
        // Find and delete the experiment if it belongs to the authenticated user
        const experiment = await Experiment.findOneAndDelete({ _id: req.params.id, user: req.user.id });
        if (!experiment) return res.status(404).json({ message: 'Experiment not found' });
        res.json({ message: 'Experiment deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// ==========================================
// START SERVER
// ==========================================
// Define the port to listen on from environment variables and start the server
const PORT = process.env.PORT ;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
