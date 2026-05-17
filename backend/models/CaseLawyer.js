const mongoose = require('mongoose');

const CaseLawyerSchema = new mongoose.Schema({
    case_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Case',
        required: true
    },
    lawyer_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lawyer',
        required: true
    },
    side: {
        type: String,
        enum: ['Prosecution', 'Defense']
    }
});

// Compound unique index to prevent duplicate links
CaseLawyerSchema.index({ case_id: 1, lawyer_id: 1 }, { unique: true });

module.exports = mongoose.model('CaseLawyer', CaseLawyerSchema);
