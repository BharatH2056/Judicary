const Verdict = require('../models/Verdict');
const Case = require('../models/Case');

// @desc    Get all verdicts
// @route   GET /api/verdicts
exports.getVerdicts = async (req, res, next) => {
    try {
        const verdicts = await Verdict.find().populate('case_id');
        res.status(200).json({ success: true, count: verdicts.length, data: verdicts });
    } catch (err) {
        next(err);
    }
};

// @desc    Get single verdict
// @route   GET /api/verdicts/:id
exports.getVerdict = async (req, res, next) => {
    try {
        const verdict = await Verdict.findById(req.params.id).populate('case_id');
        if (!verdict) return res.status(404).json({ success: false, error: 'Verdict not found' });
        res.status(200).json({ success: true, data: verdict });
    } catch (err) {
        next(err);
    }
};

// @desc    Get verdict for a specific case
// @route   GET /api/verdicts/case/:caseId
exports.getCaseVerdict = async (req, res, next) => {
    try {
        const verdict = await Verdict.findOne({ case_id: req.params.caseId });
        res.status(200).json({ success: true, data: verdict });
    } catch (err) {
        next(err);
    }
};

// @desc    Add verdict
// @route   POST /api/verdicts
exports.createVerdict = async (req, res, next) => {
    try {
        const existing = await Verdict.findOne({ case_id: req.body.case_id });
        if (existing) {
            return res.status(400).json({ success: false, error: "This case already has a verdict. Each case can only have one verdict." });
        }

        const verdict = await Verdict.create(req.body);

        // Update Case status to "Closed" automatically
        await Case.findByIdAndUpdate(req.body.case_id, { status: 'Closed' });

        res.status(201).json({ success: true, data: verdict });
    } catch (err) {
        next(err);
    }
};

// @desc    Update verdict
// @route   PUT /api/verdicts/:id
exports.updateVerdict = async (req, res, next) => {
    try {
        const verdict = await Verdict.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!verdict) return res.status(404).json({ success: false, error: 'Verdict not found' });

        res.status(200).json({ success: true, data: verdict });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete verdict
// @route   DELETE /api/verdicts/:id
exports.deleteVerdict = async (req, res, next) => {
    try {
        const verdict = await Verdict.findById(req.params.id);
        if (!verdict) return res.status(404).json({ success: false, error: 'Verdict not found' });

        await verdict.deleteOne();

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        next(err);
    }
};
