const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Message = require('../models/message');
const { protect } = require('../middleware/authMiddleware');

// ============================================================
// 1. ROUTE SPÉCIFIQUE (DOIT ÊTRE EN PREMIER !!!)
// ============================================================
router.get('/inbox/all', protect, async (req, res) => {
    try {
        const currentUserId = new mongoose.Types.ObjectId(req.user.id);

        const conversations = await Message.aggregate([
            {
                $match: {
                    $or: [{ sender: currentUserId }, { receiver: currentUserId }]
                }
            },
            { $sort: { timestamp: -1 } },
            {
                $group: {
                    _id: {
                        $cond: [{ $eq: ["$sender", currentUserId] }, "$receiver", "$sender"]
                    },
                    lastMessage: { $first: "$content" },
                    timestamp: { $first: "$timestamp" }
                }
            },
            { $sort: { timestamp: -1 } }
        ]);

        res.status(200).json(conversations);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ============================================================
// 2. ROUTE GÉNÉRIQUE (DOIT ÊTRE APRÈS)
// ============================================================
router.get('/:userId/:otherUserId', protect, async (req, res) => {
    // ... ton code existant pour lire les messages ...
    // (Je ne le remets pas tout pour garder ça court, garde ton code ici)
    try {
        const { userId, otherUserId } = req.params;
        const messages = await Message.find({
            $or: [
                { sender: userId, receiver: otherUserId },
                { sender: otherUserId, receiver: userId }
            ]
        }).sort({ timestamp: 1 });
        res.status(200).json(messages);
    } catch (err) {
        res.status(500).json(err);
    }
});

// 3. ENVOYER UN MESSAGE (POST)
router.post('/', protect, async (req, res) => {
    // ... ton code d'envoi ...
    const { receiverId, content } = req.body;
    const senderId = req.user.id;
    const newMessage = new Message({ sender: senderId, receiver: receiverId, content });
    await newMessage.save();
    res.status(200).json(newMessage);
});

module.exports = router;