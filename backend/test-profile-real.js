const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const MONGO_URI = 'mongodb+srv://main_db_user:idkmananypasswordidgaf@cluster0.wyt39in.mongodb.net/?appName=Cluster0';
const SECRET = '2b4a537f8f94e9f5e2d1c7a5b3f2e8d9c1b4a6d8f5c3e2a1b9f0d7e4c6b2a8d3';

async function test() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to DB');

    const User = mongoose.connection.collection('users');
    const user = await User.findOne({});
    if (!user) {
      console.log('No user found');
      return;
    }

    console.log('Found user:', user._id);
    
    // Generate token
    const token = jwt.sign({ userId: user._id.toString() }, SECRET, { expiresIn: '1h' });

    console.log('Sending request...');
    const res = await fetch('http://localhost:5001/api/v1/users/me', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        name: 'Test Name',
        homeCity: 'Delhi',
        college: 'Test College',
        gender: 'MALE',
      })
    });

    const data = await res.json();
    console.log('Status:', res.status);
    console.log('Response:', data);
  } catch (err) {
    console.error('Failed:', err.message);
  } finally {
    await mongoose.disconnect();
  }
}

test();
