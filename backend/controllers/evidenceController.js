const Evidence = require('../models/Evidence');

// @desc    Get all evidence
// @route   GET /api/evidence
exports.getAllEvidence = async (req, res, next) => {
  try {
    const evidence = await Evidence.find().populate('case_id')
    res.status(200).json({ success: true, count: evidence.length, data: evidence })
  } catch (err) {
    next(err)
  }
};

// @desc    Get evidence for a case
// @route   GET /api/evidence/case/:caseId
exports.getCaseEvidence = async (req, res, next) => {
    try {
        const evidence = await Evidence.find({ case_id: req.params.caseId });
        res.status(200).json({ success: true, count: evidence.length, data: evidence });
    } catch (err) {
        next(err);
    }
};

// @desc    Get single evidence
// @route   GET /api/evidence/:id
exports.getEvidence = async (req, res, next) => {
    try {
        const evidence = await Evidence.findById(req.params.id);
        if (!evidence) return res.status(404).json({ success: false, error: 'Evidence not found' });
        res.status(200).json({ success: true, data: evidence });
    } catch (err) {
        next(err);
    }
};

// @desc    Submit evidence
// @route   POST /api/evidence
exports.createEvidence = async (req, res, next) => {
    try {
        const evidence = await Evidence.create(req.body);
        res.status(201).json({ success: true, data: evidence });
    } catch (err) {
        next(err);
    }
};

// @desc    Update evidence
// @route   PUT /api/evidence/:id
exports.updateEvidence = async (req, res, next) => {
    try {
        const evidence = await Evidence.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!evidence) return res.status(404).json({ success: false, error: 'Evidence not found' });

        res.status(200).json({ success: true, data: evidence });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete evidence
// @route   DELETE /api/evidence/:id
exports.deleteEvidence = async (req, res, next) => {
    try {
        const evidence = await Evidence.findById(req.params.id);
        if (!evidence) return res.status(404).json({ success: false, error: 'Evidence not found' });

        await evidence.deleteOne();

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        next(err);
    }
};
