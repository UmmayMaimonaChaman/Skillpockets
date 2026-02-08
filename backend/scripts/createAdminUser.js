const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

async function createAdmin() {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  const email = 'chamanmaimona@gmail.com';
  const password = 'Chaman@5204';
  const name = 'Ummay Maimona Chaman';
  let user = await User.findOne({ email });
  if (!user) {
    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({
      name,
      email,
      password: hashedPassword,
      role: 'admin',
    });
    await user.save();
    console.log('Admin user created');
  } else {
    user.role = 'admin';
    user.name = name;
    user.password = await bcrypt.hash(password, 10);
    await user.save();
    console.log('Admin user updated');
  }
  mongoose.disconnect();
}

createAdmin(); 