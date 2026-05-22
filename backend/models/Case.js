const mongoose = require('mongoose');

const CaseSchema = new mongoose.Schema({
    case_id: {
        type: String,
        unique: true
    },
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true
    },
    type: {
        type: String,
        enum: ['Criminal', 'Civil', 'Family', 'Corporate'],
        required: [true, 'Please specify case type']
    },
    status: {
        type: String,
        enum: ['Open', 'Pending', 'Closed'],
        default: 'Open'
    },
    filing_date: {
        type: Date,
        default: Date.now
    },
    notes: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

// Pre-save hook: auto-generate case_id as "C-" + padded counter
CaseSchema.pre('save', async function(next) {
    if (!this.case_id) {
        const count = await this.constructor.countDocuments();
        this.case_id = `C-${(count + 1001).toString()}`;
    }
    next();
});

module.exports = mongoose.model('Case', CaseSchema);
