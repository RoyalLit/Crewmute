const mongoose = require('mongoose');
require('dotenv').config();
async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const rides = await mongoose.connection.db.collection('rides').find({}).sort({createdAt: -1}).limit(5).toArray();
  console.log("Latest 5 Rides:", JSON.stringify(rides.map(r => ({id: r._id, posterId: r.posterId, status: r.status, date: r.departureDate, time: r.departureTime, totalSeats: r.totalSeats})), null, 2));
  process.exit(0);
}
run();
