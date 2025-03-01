const admin = require('../util/firebaseAdmin');
const supabase = require('../util/supabaseclient');



module.exports = async (req, res) => {
    const { senderId, receiverId, msg } = req.body;
    console.log(senderId, receiverId, msg);
    try {
        // Fetch sender data from Supabase
        const { data: sender, error: senderError } = await supabase
            .from('users')
            .select('id, name')
            .eq('id', senderId)
            .single();

        if (senderError) throw new Error('Error fetching sender data');
        if (!sender) throw new Error('Sender not found');
        console.log(sender);

        // Fetch receiver data from Supabase
        const { data: receiver, error: receiverError } = await supabase
            .from('users')
            .select('notification_token')
            .eq('id', receiverId)
            .single();
        console.log(receiver);
        if (receiverError) throw new Error('Error fetching receiver data');
        if (!receiver) throw new Error('Receiver not found');
        if (!receiver.notification_token || receiver.notification_token.length === 0) {
            return res.status(400).json({ error: "Receiver has no FCM tokens" });
        }

        // Send notification to all tokens
        const notificationPromises = receiver.notification_token.map(token => {
            const message = {
                token: token,
                notification: {
                    title: `New message from ${sender.name}`,
                    body: msg || "You have received a new message",
                },
                data: { click_action: "FLUTTER_NOTIFICATION_CLICK" },
            };

            return admin.messaging().send(message);
        });

        const results = await Promise.all(notificationPromises);
        console.log('Notifications sent:', results);

        return res.status(200).json({ message: "Notifications sent successfully" });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
}