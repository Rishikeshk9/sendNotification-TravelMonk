const admin = require('firebase-admin');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
//
const app = express();
const port = process.env.PORT || 3000;

// Add CORS middleware
app.use(cors());
app.use(bodyParser.json());

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
);

// Initialize Firebase Admin SDK
const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_SDK_KEY);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
app.get('/', (req, res) => res.send('Express on Vercel'));

// Send Notification API
app.post('/send-notification', async (req, res) => {
  console.log('Received request body:', req.body);

  const { title, body } = req.body;

  if (!title || !body) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
//asd
  try {
    // Fetch all device tokens from Supabase
    const { data: deviceTokens, error } = await supabase
      .from('device_tokens')
      .select('device_token');

    if (error) {
      throw new Error(`Error fetching device tokens: ${error.message}`);
    }

    if (!deviceTokens || deviceTokens.length === 0) {
      return res.status(404).json({ error: 'No device tokens found' });
    }

    // Send notifications to all devices
    const sendPromises = deviceTokens.map(async ({ device_token }) => {
      const message = {
        notification: {
          title,
          body,
        },
        token: device_token,
      };

      try {
        return await admin.messaging().send(message);
      } catch (error) {
        console.error(`Error sending to token ${device_token}:`, error);
        return null;
      }
    });

    const results = await Promise.all(sendPromises);
    const successfulSends = results.filter((result) => result !== null);

    res.json({
      success: true,
      messagesSent: successfulSends.length,
      totalDevices: deviceTokens.length,
    });
  } catch (error) {
    console.error('Error in notification process:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
