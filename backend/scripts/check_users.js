const mongoose = require('mongoose');
require('dotenv').config();
async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const users = await mongoose.connection.db.collection('users').find({}).toArray();
  console.log("Users:", JSON.stringify(users.map(u => ({id: u._id, email: u.email, name: u.name})), null, 2));
  process.exit(0);
}
run();
