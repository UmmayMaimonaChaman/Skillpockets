const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Skill = require('../models/Skill');
require('dotenv').config();

async function createUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const users = [
      {
        name: 'Prova',
        email: 'nazifaprova@gmail.com',
        password: 'PROVAtoxic',
        skill: 'paint',
      },
      {
        name: 'Onon',
        email: 'tazniaonon@gmail.com',
        password: 'ONONgoru',
        skill: 'coding',
      },
      {
        name: 'Rizve',
        email: 'rizveahmed@gmail.com',
        password: 'RIZVEgondar',
        skill: 'circuit',
      },
      {
        name: 'Jubaida',
        email: 'jubaida@gmail.com',
        password: 'JUBAIDAcat',
        skill: 'Biotech',
      },
    ];

    for (const userData of users) {
      let user = await User.findOne({ email: userData.email });
      if (!user) {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        user = new User({
          name: userData.name,
          email: userData.email,
          password: hashedPassword,
          role: 'user',
        });
        await user.save();
        console.log(`User ${userData.name} created`);

        // Create skill for this user
        const skill = new Skill({
          title: userData.skill,
          description: `${userData.name} is skilled in ${userData.skill}`,
          category: 'General',
          type: 'offer',
          owner: user._id,
          isApproved: true,
        });
        await skill.save();
        console.log(`Skill "${userData.skill}" created for ${userData.name}`);
      } else {
        console.log(`User ${userData.name} already exists`);
      }
    }
  } catch (err) {
    console.error('Error creating users and skills:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Database connection closed');
  }
}

createUsers();
