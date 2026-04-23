require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(express.json());

// ==========================================
// MONGODB CONNECTION
// ==========================================
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// ==========================================
// MODELS
// ==========================================
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

const experimentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    technology: { type: String, required: true },
    setupSteps: { type: String },
    observations: { type: String },
    errorsFaced: { type: String },
    solutionsDiscovered: { type: String }
}, { timestamps: true });

experimentSchema.index({ title: 'text', errorsFaced: 'text', solutionsDiscovered: 'text' });
const Experiment = mongoose.model('Experiment', experimentSchema);

// ==========================================
// MIDDLEWARE
// ==========================================
const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

// ==========================================
// ROUTES
// ==========================================

app.get('/', (req, res) => res.send('DevLab API is running'));

// --- AUTHENTICATION ---
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ name, email, password: hashedPassword });
        await user.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// --- EXPERIMENTS ---
// Get all experiments for user
app.get('/api/experiments', authenticate, async (req, res) => {
    try {
        const query = { user: req.user.id };
        if (req.query.technology) query.technology = req.query.technology;
        const experiments = await Experiment.find(query).sort({ createdAt: -1 });
        res.json(experiments);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Search experiments
app.get('/api/search', authenticate, async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.json([]);
        const experiments = await Experiment.find({
            user: req.user.id,
            $text: { $search: q }
        });
        res.json(experiments);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get specific experiment
app.get('/api/experiments/:id', authenticate, async (req, res) => {
    try {
        const experiment = await Experiment.findOne({ _id: req.params.id, user: req.user.id });
        if (!experiment) return res.status(404).json({ message: 'Experiment not found' });
        res.json(experiment);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Create experiment
app.post('/api/experiments', authenticate, async (req, res) => {
    try {
        const experiment = new Experiment({ ...req.body, user: req.user.id });
        await experiment.save();
        res.status(201).json(experiment);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update experiment
app.put('/api/experiments/:id', authenticate, async (req, res) => {
    try {
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

// Delete experiment
app.delete('/api/experiments/:id', authenticate, async (req, res) => {
    try {
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
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
