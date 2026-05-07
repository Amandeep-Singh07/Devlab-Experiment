require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { GoogleGenAI } = require("@google/genai");

const app = express();

app.use(cors());

app.use(express.json());

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);

const experimentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    technology: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner",
    },
    tags: [{ type: String }],
    timeTaken: { type: String },
    views: { type: Number, default: 0 },
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
    setupSteps: { type: String },
    observations: { type: String },
    errorsFaced: { type: String },
    solutionsDiscovered: { type: String },
  },
  { timestamps: true },
);

experimentSchema.index({
  title: "text",
  errorsFaced: "text",
  solutionsDiscovered: "text",
  tags: "text",
});

const Experiment = mongoose.model("Experiment", experimentSchema);

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

app.get("/", (req, res) => res.send("DevLab API is running"));

app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate name
    if (!name || name.trim().length < 2) {
      return res
        .status(400)
        .json({ message: "Full name must be at least 2 characters long" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return res
        .status(400)
        .json({ message: "Please provide a valid email address" });
    }

    // Validate password
    if (!password || password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters long" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name: name.trim(),
      email: email.toLowerCase(),
      password: hashedPassword,
    });
    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.put("/api/auth/change-password", authenticate, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!newPassword || newPassword.length < 8) {
      return res
        .status(400)
        .json({ message: "New password must be at least 8 characters long" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid current password" });

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.get("/api/experiments", authenticate, async (req, res) => {
  try {
    const query = { user: req.user.id };
    const { q } = req.query;         // Extracts query parameter from URL.

    if (q) query.$text = { $search: q };

    const experiments = await Experiment.find(query).sort({ createdAt: -1 });
    res.json(experiments);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});


app.get("/api/experiments/:id", authenticate, async (req, res) => {
  try {
    const experiment = await Experiment.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { $inc: { views: 1 } },
      { new: true },
    );
    if (!experiment)
      return res.status(404).json({ message: "Experiment not found" });
    res.json(experiment);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.post("/api/experiments/:id/upvote", authenticate, async (req, res) => {
  try {
    const experiment = await Experiment.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { $inc: { upvotes: 1 } },
      { new: true },
    );
    if (!experiment)
      return res.status(404).json({ message: "Experiment not found" });
    res.json(experiment);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.post("/api/experiments/:id/downvote", authenticate, async (req, res) => {
  try {
    const experiment = await Experiment.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { $inc: { downvotes: 1 } },
      { new: true },
    );
    if (!experiment)
      return res.status(404).json({ message: "Experiment not found" });
    res.json(experiment);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// to add new experiment
app.post("/api/experiments", authenticate, async (req, res) => {
  try {
    const experiment = new Experiment({ ...req.body, user: req.user.id });
    await experiment.save();
    res.status(201).json(experiment);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Update an existing experiment
app.put("/api/experiments/:id", authenticate, async (req, res) => {
  try {
    // Find the experiment by ID and update it with the new data from req.body
    const experiment = await Experiment.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true },
    );
    if (!experiment)
      return res.status(404).json({ message: "Experiment not found" });
    res.json(experiment);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.delete("/api/experiments/:id", authenticate, async (req, res) => {
  try {
    const experiment = await Experiment.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });
    if (!experiment)
      return res.status(404).json({ message: "Experiment not found" });
    res.json({ message: "Experiment deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.post("/api/ai/ask", authenticate, async (req, res) => {
  try {
    const { prompt, context } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        message: "Gemini API key is missing in backend configuration",
      });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const systemInstruction = `You are an AI assistant inside a developer learning platform called DevLab.

Your role:
- Help users understand programming experiments
- Explain errors in simple terms
- Suggest practical solutions
- Compare technologies when asked

Rules:
- Be concise but clear
- Use examples when helpful
- Avoid unnecessary theory
- Focus on real-world debugging and learning

If user provides an error:
- Explain cause
- Suggest fix
- Give code example if possible.

Additional Context:
${context || "No specific experiment context provided."}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        temperature: 0.7,
        maxOutputTokens: 1000,
        systemInstruction: systemInstruction,
      },
    });

    res.json({ text: response.text });
  } catch (error) {
    console.error("AI Assistant Error:", error);
    res
      .status(500)
      .json({ message: "Error generating AI response", error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
