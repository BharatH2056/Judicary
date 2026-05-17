const Lawyer = require('../models/Lawyer');
const CaseLawyer = require('../models/CaseLawyer');

// @desc    Get all lawyers
// @route   GET /api/lawyers
exports.getLawyers = async (req, res, next) => {
    try {
        const lawyers = await Lawyer.find();
        res.status(200).json({ success: true, count: lawyers.length, data: lawyers });
    } catch (err) {
        next(err);
    }
};

// @desc    Get single lawyer
// @route   GET /api/lawyers/:id
exports.getLawyer = async (req, res, next) => {
    try {
        const lawyer = await Lawyer.findById(req.params.id);
        if (!lawyer) return res.status(404).json({ success: false, error: 'Lawyer not found' });
        res.status(200).json({ success: true, data: lawyer });
    } catch (err) {
        next(err);
    }
};

// @desc    Get cases handled by a lawyer
// @route   GET /api/lawyers/:id/cases
exports.getLawyerCases = async (req, res, next) => {
    try {
        const cases = await CaseLawyer.find({ lawyer_id: req.params.id }).populate('case_id');
        res.status(200).json({ success: true, count: cases.length, data: cases });
    } catch (err) {
        next(err);
    }
};

// @desc    Create lawyer
// @route   POST /api/lawyers
exports.createLawyer = async (req, res, next) => {
    try {
        const lawyer = await Lawyer.create(req.body);
        res.status(201).json({ success: true, data: lawyer });
    } catch (err) {
        next(err);
    }
};

// @desc    Update lawyer
// @route   PUT /api/lawyers/:id
exports.updateLawyer = async (req, res, next) => {
    try {
        const lawyer = await Lawyer.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!lawyer) return res.status(404).json({ success: false, error: 'Lawyer not found' });

        res.status(200).json({ success: true, data: lawyer });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete lawyer
// @route   DELETE /api/lawyers/:id
exports.deleteLawyer = async (req, res, next) => {
    try {
        const lawyer = await Lawyer.findById(req.params.id);
        if (!lawyer) return res.status(404).json({ success: false, error: 'Lawyer not found' });

        await Promise.all([
            lawyer.deleteOne(),
            CaseLawyer.deleteMany({ lawyer_id: req.params.id })
        ]);

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        next(err);
    }
};
