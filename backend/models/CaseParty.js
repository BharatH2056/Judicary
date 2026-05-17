const mongoose = require('mongoose');

const CasePartySchema = new mongoose.Schema({
    case_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Case',
        required: true
    },
    party_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Party',
        required: true
    },
    role_in_case: {
        type: String
    }
});

// Compound unique index to prevent duplicate links
CasePartySchema.index({ case_id: 1, party_id: 1 }, { unique: true });

module.exports = mongoose.model('CaseParty', CasePartySchema);
