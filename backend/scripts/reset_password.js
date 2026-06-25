const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

async function resetPasswords() {
  await mongoose.connect('mongodb+srv://main_db_user:idkmananypasswordidgaf@cluster0.wyt39in.mongodb.net/?appName=Cluster0');
  const db = mongoose.connection.db;
  
  const hashedPassword = await bcrypt.hash('password123', 12);
  
  await db.collection('users').updateMany({}, {
    $set: { password: hashedPassword }
  });
  
  console.log('All passwords have been reset to: password123');
  await mongoose.disconnect();
}

resetPasswords().catch(console.error);
