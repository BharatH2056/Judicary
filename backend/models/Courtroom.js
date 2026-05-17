const mongoose = require('mongoose');

const CourtroomSchema = new mongoose.Schema({
    room_id: {
        type: String,
        unique: true
    },
    room_no: {
        type: String,
        required: [true, 'Please add a room number']
    },
    floor: {
        type: Number
    },
    capacity: {
        type: Number
    },
    status: {
        type: String,
        enum: ['Available', 'In Use', 'Maintenance'],
        default: 'Available'
    },
    judge_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Judge',
        unique: true,
        sparse: true
    }
});

// Auto-generate room_id
CourtroomSchema.pre('save', async function(next) {
    if (!this.room_id) {
        const count = await this.constructor.countDocuments();
        this.room_id = `CR-${(count + 1).toString().padStart(2, '0')}`;
    }
    next();
});

module.exports = mongoose.model('Courtroom', CourtroomSchema);
