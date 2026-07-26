require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({}, { strict: false });
const UserModel = mongoose.model('User', userSchema);

async function createTestUsers() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/crewmute');
  console.log('Connected to MongoDB');

  const saltRounds = 12;
  const password = await bcrypt.hash('Password123!', saltRounds);

  const testUsers = [
    {
      email: 'testuser2@crewmute.com',
      password,
      name: 'Priya Sharma',
      gender: 'FEMALE',
      college: 'Amity University Noida',
      homeCity: 'Noida',
      upiId: 'priya@upi',
      isEmailVerified: true,
      isCollegeVerified: true,
      emergencyContacts: [
        { name: 'Dad', phone: '+919876543210' },
        { name: 'Mom', phone: '+919876543211' }
      ]
    },
    {
      email: 'testuser3@crewmute.com',
      password,
      name: 'Aman Verma',
      gender: 'MALE',
      college: 'Chandigarh University',
      homeCity: 'Chandigarh',
      upiId: 'aman@upi',
      isEmailVerified: true,
      isCollegeVerified: true,
      emergencyContacts: [
        { name: 'Brother', phone: '+919876543212' }
      ]
    }
  ];

  for (const u of testUsers) {
    const existing = await UserModel.findOne({ email: u.email });
    if (existing) {
      await UserModel.updateOne({ email: u.email }, { $set: u });
      console.log(`Updated user: ${u.email}`);
    } else {
      await UserModel.create(u);
      console.log(`Created user: ${u.email}`);
    }
  }

  process.exit(0);
}

createTestUsers().catch(err => {
  console.error(err);
  process.exit(1);
});
