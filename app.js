const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const sendChatNotification = require('./controller/sendChatNotification');
// Middleware to parse JSON bodies
app.use(express.json());

// Basic route
app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.post('/sendChatNotification', sendChatNotification);
// Start server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});



module.exports = app;