const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const skillRoutes = require('./routes/skill');
const skillRequestRoutes = require('./routes/skillRequest');
const sessionRoutes = require('./routes/session');
const reviewRoutes = require('./routes/review');
const adminRoutes = require('./routes/admin');
const adminAuthRoutes = require('./routes/adminAuth');

const PORT = process.env.PORT || 5001;

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection error:', err));

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/skill-requests', skillRequestRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin-auth', adminAuthRoutes);

app.get('/', (req, res) => {
  res.send('SkillSwap Hub API is running!');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 