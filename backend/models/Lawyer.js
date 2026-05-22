const mongoose = require('mongoose');

const LawyerSchema = new mongoose.Schema({
    lawyer_id: {
        type: String,
        unique: true
    },
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    bar_number: {
        type: String,
        unique: true,
        required: [true, 'Please add bar number']
    },
    specialization: {
        type: String
    },
    contact: {
        type: String
    },
    email: {
        type: String,
        default: ''
    }
});

// Auto-generate lawyer_id
LawyerSchema.pre('save', async function(next) {
    if (!this.lawyer_id) {
        const count = await this.constructor.countDocuments();
        this.lawyer_id = `L-${(count + 1).toString().padStart(3, '0')}`;
    }
    next();
});

module.exports = mongoose.model('Lawyer', LawyerSchema);
