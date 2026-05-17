const mongoose = require('mongoose');

const PartySchema = new mongoose.Schema({
    party_id: {
        type: String,
        unique: true
    },
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    role: {
        type: String,
        enum: ['Plaintiff', 'Defendant', 'Witness']
    },
    contact: {
        type: String
    },
    address: {
        type: String
    }
});

// Auto-generate party_id
PartySchema.pre('save', async function(next) {
    if (!this.party_id) {
        const count = await this.constructor.countDocuments();
        this.party_id = `P-${(count + 1).toString().padStart(3, '0')}`;
    }
    next();
});

module.exports = mongoose.model('Party', PartySchema);
