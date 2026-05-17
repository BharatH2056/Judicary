const mongoose = require('mongoose');

const VerdictSchema = new mongoose.Schema({
    verdict_id: {
        type: String,
        unique: true
    },
    case_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Case',
        required: true,
        unique: true
    },
    decision: {
        type: String,
        enum: ['Guilty', 'Not Guilty', 'Dismissed', 'Acquitted']
    },
    penalty: {
        type: String
    },
    verdict_date: {
        type: Date,
        required: true
    }
});

// Auto-generate verdict_id
VerdictSchema.pre('save', async function(next) {
    if (!this.verdict_id) {
        const count = await this.constructor.countDocuments();
        this.verdict_id = `V-${(count + 1).toString().padStart(3, '0')}`;
    }
    next();
});

module.exports = mongoose.model('Verdict', VerdictSchema);
