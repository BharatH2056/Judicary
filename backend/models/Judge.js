const mongoose = require('mongoose');

const JudgeSchema = new mongoose.Schema({
    judge_id: {
        type: String,
        unique: true
    },
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    specialization: {
        type: String,
        enum: ['Criminal', 'Civil', 'Family', 'Corporate']
    },
    experience_yrs: {
        type: Number,
        min: 0
    },
    email: {
        type: String,
        default: ''
    },
    phone: {
        type: String,
        default: ''
    },
    courtroom_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Courtroom',
        unique: true,
        sparse: true
    }
});

// Auto-generate judge_id
JudgeSchema.pre('save', async function(next) {
    if (!this.judge_id) {
        const lastJudge = await this.constructor.findOne().sort({ createdAt: -1 });
        const lastNum = lastJudge && lastJudge.judge_id ? parseInt(lastJudge.judge_id.split('-')[1]) : 0;
        this.judge_id = `J-${(lastNum + 1).toString().padStart(3, '0')}`;
    }
    next();
});

module.exports = mongoose.model('Judge', JudgeSchema);
