const admin = require("firebase-admin");
const serviceAccount = require("./../u_traffic_service_key.json");
const dotenv = require("dotenv");

dotenv.config();

const firebaseConfig = {
  credential: admin.credential.cert(serviceAccount),
  projectId: process.env.PROJECT_ID,
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  databaseURL: process.env.DATABASE_URL,
  storageBucket: process.env.STORAGE_BUCKET,
};

admin.initializeApp(firebaseConfig);

const firestore = admin.firestore();

module.exports = firestore;
