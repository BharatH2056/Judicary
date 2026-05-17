const CaseParty = require('../models/CaseParty');

// @desc    Get all parties in a case
// @route   GET /api/case-party/:caseId
exports.getCaseParties = async (req, res, next) => {
    try {
        const parties = await CaseParty.find({ case_id: req.params.caseId }).populate('party_id');
        res.status(200).json({ success: true, count: parties.length, data: parties });
    } catch (err) {
        next(err);
    }
};

// @desc    Link party to case
// @route   POST /api/case-party
exports.linkPartyToCase = async (req, res, next) => {
    try {
        const caseParty = await CaseParty.create(req.body);
        res.status(201).json({ success: true, data: caseParty });
    } catch (err) {
        next(err);
    }
};

// @desc    Unlink party from case
// @route   DELETE /api/case-party
exports.unlinkPartyFromCase = async (req, res, next) => {
    try {
        const { case_id, party_id } = req.body;
        const caseParty = await CaseParty.findOneAndDelete({ case_id, party_id });

        if (!caseParty) {
            return res.status(404).json({ success: false, error: 'Link not found' });
        }

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        next(err);
    }
};
