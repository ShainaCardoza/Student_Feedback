const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ─── MONGODB CONNECTION OPTIMIZATION ──────────────────
const MONGO_URI = process.env.MONGO_URI;

// Vercel re-uses containers. This prevents opening multiple connections.
let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;
  try {
    const db = await mongoose.connect(MONGO_URI);
    isConnected = db.connections[0].readyState;
    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
  }
};

// Connect to DB immediately
connectDB();

// ─── SCHEMA & MODEL ───────────────────────────────────
// We use a check to prevent recompiling the model on every function call
const feedbackSchema = new mongoose.Schema({
  studentName: { type: String, required: true, trim: true },
  courseName: { type: String, required: true, trim: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comments: { type: String, trim: true, default: '' }
}, { timestamps: true });

const Feedback = mongoose.models.Feedback || mongoose.model('Feedback', feedbackSchema);

// ─── ROUTES ───────────────────────────────────────────

app.post('/api/feedback', async (req, res) => {
  try {
    await connectDB();
    const { studentName, courseName, rating, comments } = req.body;
    const feedback = new Feedback({ studentName, courseName, rating, comments });
    await feedback.save();
    res.status(201).json({ success: true, data: feedback });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/feedback', async (req, res) => {
  try {
    await connectDB();
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: feedbacks.length, data: feedbacks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete('/api/feedback/:id', async (req, res) => {
  try {
    await connectDB();
    const feedback = await Feedback.findByIdAndDelete(req.params.id);
    if (!feedback) return res.status(404).json({ success: false, message: 'Not found' });
    res.status(200).json({ success: true, message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api', (req, res) => {
  res.json({ message: '🎓 Student Feedback API is running' });
});

// ─── VERCEL EXPORT ────────────────────────────────────
// Local development: keep the server listening
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🚀 Local server: http://localhost:${PORT}`));
}

// THIS IS THE MOST IMPORTANT LINE FOR VERCEL
module.exports = app;