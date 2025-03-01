const admin = require("firebase-admin");
const dotenv = require("dotenv").config();

// Parse the JSON string from the environment variable
const serviceAccount = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS);
console.log(serviceAccount);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
