const mongoose = require('mongoose');

async function checkUser() {
  await mongoose.connect('mongodb+srv://main_db_user:idkmananypasswordidgaf@cluster0.wyt39in.mongodb.net/?appName=Cluster0');
  const db = mongoose.connection.db;
  const users = await db.collection('users').find({}).toArray();
  console.log('Total users:', users.length);
  users.forEach(u => {
    console.log(`- Email: ${u.email}, isVerified: ${u.isEmailVerified}, hasPassword: ${!!u.password}`);
  });
  await mongoose.disconnect();
}

checkUser().catch(console.error);
