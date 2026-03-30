let messageModel = require('../schemas/message');
let mongoose = require('mongoose');

module.exports = {
    getMessagesBetweenUsers: async function (currentUserId, otherUserId) {
        return await messageModel.find({
            $or: [
                { from: currentUserId, to: otherUserId },
                { from: otherUserId, to: currentUserId }
            ]
        }).sort({ createdAt: 1 })
          .populate({ path: 'from', select: 'username fullName avatarUrl' })
          .populate({ path: 'to', select: 'username fullName avatarUrl' });
    },
    createMessage: async function (from, to, type, content) {
        let messageType = 'text';
        if (type === 'file') {
            messageType = 'file';
        }
        let newItem = new messageModel({
            from: from,
            to: to,
            contentMessage: {
                type: messageType,
                content: content
            }
        });
        await newItem.save();
        return newItem;
    },
    getLatestMessages: async function (currentUserId) {
        return await messageModel.aggregate([
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
    }
}
