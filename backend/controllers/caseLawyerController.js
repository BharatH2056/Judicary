const CaseLawyer = require('../models/CaseLawyer');

// @desc    Get all lawyers on a case
// @route   GET /api/case-lawyer/:caseId
exports.getCaseLawyers = async (req, res, next) => {
    try {
        const lawyers = await CaseLawyer.find({ case_id: req.params.caseId }).populate('lawyer_id');
        res.status(200).json({ success: true, count: lawyers.length, data: lawyers });
    } catch (err) {
        next(err);
    }
};

// @desc    Assign lawyer to case
// @route   POST /api/case-lawyer
exports.assignLawyerToCase = async (req, res, next) => {
    try {
        const caseLawyer = await CaseLawyer.create(req.body);
        res.status(201).json({ success: true, data: caseLawyer });
    } catch (err) {
        next(err);
    }
};

// @desc    Remove lawyer from case
// @route   DELETE /api/case-lawyer
exports.removeLawyerFromCase = async (req, res, next) => {
    try {
        const { case_id, lawyer_id } = req.body;
        const caseLawyer = await CaseLawyer.findOneAndDelete({ case_id, lawyer_id });

        if (!caseLawyer) {
            return res.status(404).json({ success: false, error: 'Link not found' });
        }

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        next(err);
    }
};
