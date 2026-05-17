const mongoose = require('mongoose');

const HearingSchema = new mongoose.Schema({
    hearing_id: {
        type: String,
        unique: true
    },
    case_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Case',
        required: true
    },
    judge_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Judge',
        required: true
    },
    courtroom_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Courtroom'
    },
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String
    },
    outcome: {
        type: String,
        default: 'Scheduled'
    },
    notes: {
        type: String
    }
});

// Auto-generate hearing_id
HearingSchema.pre('save', async function(next) {
    if (!this.hearing_id) {
        const count = await this.constructor.countDocuments();
        this.hearing_id = `H-${(count + 1).toString().padStart(3, '0')}`;
    }
    next();
});

module.exports = mongoose.model('Hearing', HearingSchema);
