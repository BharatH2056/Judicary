const mongoose = require('mongoose');

const EvidenceSchema = new mongoose.Schema({
    evidence_id: {
        type: String,
        unique: true
    },
    case_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Case',
        required: true
    },
    type: {
        type: String,
        enum: ['Document', 'Physical', 'Digital', 'Testimony']
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    submitted_by: {
        type: String
    },
    submitted_date: {
        type: Date,
        default: Date.now
    }
});

// Auto-generate evidence_id
EvidenceSchema.pre('save', async function(next) {
    if (!this.evidence_id) {
        const count = await this.constructor.countDocuments();
        this.evidence_id = `E-${(count + 1).toString().padStart(3, '0')}`;
    }
    next();
});

module.exports = mongoose.model('Evidence', EvidenceSchema);
