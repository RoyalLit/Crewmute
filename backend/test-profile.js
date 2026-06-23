const jwt = require('jsonwebtoken');

const SECRET = '2b4a537f8f94e9f5e2d1c7a5b3f2e8d9c1b4a6d8f5c3e2a1b9f0d7e4c6b2a8d3';

async function test() {
  try {
    // Generate token
    const token = jwt.sign({ userId: '662b1b3b2b1b3b2b1b3b2b1b' }, SECRET, { expiresIn: '1h' });

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
  }
}

test();
