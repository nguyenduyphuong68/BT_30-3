let mongoose = require('mongoose')
let messageSchema = mongoose.Schema({
    from: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    to: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    contentMessage: {
        type: {
            type: String,
            enum: ['file', 'text'],
            required: true,
            default: 'text'
        },
        content: {
            type: String,
            required: true
        }
    }
}, {
    timestamps: true
})
module.exports = new mongoose.model('message', messageSchema)
