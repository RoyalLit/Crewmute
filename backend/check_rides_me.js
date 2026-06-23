const { MongoClient } = require('mongodb');
require('dotenv').config();
async function run() {
  const client = new MongoClient(process.env.MONGO_URI);
  await client.connect();
  const db = client.db('test'); // Wait, Atlas URI ends with 'appName=Cluster0' so db is test
  const rides = await db.collection('rides').find({ posterId: "6a2f885157ad58890c14d820" }).toArray();
  console.log("Rides from driver:", rides.length);
  process.exit(0);
}
run();
