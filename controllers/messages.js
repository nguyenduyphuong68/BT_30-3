const messageSchema = require('../schemas/message');
const mongoose = require('mongoose');

module.exports = {
  getMessagesBetweenUsers: async (req, res) => {
    try {
      const currentUserId = req.userId;
      const otherUserId = req.params.userID;
      
      const messages = await messageSchema.find({
        $or: [
          { from: currentUserId, to: otherUserId },
          { from: otherUserId, to: currentUserId }
        ]
      }).sort({ createdAt: 1 })
        .populate('from', 'username fullName avatarUrl')
        .populate('to', 'username fullName avatarUrl');
      
      res.status(200).send({
        success: true,
        data: messages
      });
    } catch (error) {
      res.status(500).send({
        success: false,
        message: error.message
      });
    }
  },

  createMessage: async (req, res) => {
    try {
      const currentUserId = req.userId;
      const { to, type, content } = req.body;
      
      if (!to || !content) {
         return res.status(400).send({ success: false, message: "Missing required fields: to, content" });
      }

      let messageType = 'text';
      if (type === 'file') {
        messageType = 'file';
      }

      const newMessage = new messageSchema({
        from: currentUserId,
        to: to,
        contentMessage: {
          type: messageType,
          content: content
        }
      });
      
      await newMessage.save();
      
      res.status(201).send({
        success: true,
        data: newMessage
      });
    } catch (error) {
      res.status(500).send({
        success: false,
        message: error.message
      });
    }
  },

  getLatestMessages: async (req, res) => {
    try {
      const currentUserId = req.userId;
      
      const latestMessages = await messageSchema.aggregate([
        {
          $match: {
            $or: [
              { from: new mongoose.Types.ObjectId(currentUserId) },
              { to: new mongoose.Types.ObjectId(currentUserId) }
            ]
          }
        },
        {
          $sort: { createdAt: -1 }
        },
        {
          $group: {
            _id: {
              $cond: {
                if: { $eq: ["$from", new mongoose.Types.ObjectId(currentUserId)] },
                then: "$to",
                else: "$from"
              }
            },
            message: { $first: "$$ROOT" }
          }
        },
        {
           $lookup: {
             from: "users",
             localField: "_id",
             foreignField: "_id",
             as: "chatPartner"
           }
        },
        {
            $unwind: {
                path: "$chatPartner",
                preserveNullAndEmptyArrays: true
            }
        },
        {
          $project: {
            "chatPartner.password": 0,
            "chatPartner.role": 0,
            "chatPartner.loginCount": 0,
            "chatPartner.isDeleted": 0,
            "chatPartner.__v": 0
          }
        },
        {
            $sort: { "message.createdAt": -1 }
        }
      ]);
      
      res.status(200).send({
        success: true,
        data: latestMessages
      });
    } catch (error) {
      res.status(500).send({
        success: false,
        message: error.message
      });
    }
  }
};
