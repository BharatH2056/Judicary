const Party = require('../models/Party');
const CaseParty = require('../models/CaseParty');

// @desc    Get all parties
// @route   GET /api/parties
exports.getParties = async (req, res, next) => {
    try {
        const parties = await Party.find();
        res.status(200).json({ success: true, count: parties.length, data: parties });
    } catch (err) {
        next(err);
    }
};

// @desc    Get single party
// @route   GET /api/parties/:id
exports.getParty = async (req, res, next) => {
    try {
        const party = await Party.findById(req.params.id);
        if (!party) return res.status(404).json({ success: false, error: 'Party not found' });
        res.status(200).json({ success: true, data: party });
    } catch (err) {
        next(err);
    }
};

// @desc    Get cases for a party
// @route   GET /api/parties/:id/cases
exports.getPartyCases = async (req, res, next) => {
    try {
        const cases = await CaseParty.find({ party_id: req.params.id }).populate('case_id');
        res.status(200).json({ success: true, count: cases.length, data: cases });
    } catch (err) {
        next(err);
    }
};

// @desc    Create party
// @route   POST /api/parties
exports.createParty = async (req, res, next) => {
    try {
        const party = await Party.create(req.body);
        res.status(201).json({ success: true, data: party });
    } catch (err) {
        next(err);
    }
};

// @desc    Update party
// @route   PUT /api/parties/:id
exports.updateParty = async (req, res, next) => {
    try {
        const party = await Party.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!party) return res.status(404).json({ success: false, error: 'Party not found' });

        res.status(200).json({ success: true, data: party });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete party
// @route   DELETE /api/parties/:id
exports.deleteParty = async (req, res, next) => {
    try {
        const party = await Party.findById(req.params.id);
        if (!party) return res.status(404).json({ success: false, error: 'Party not found' });

        await Promise.all([
            party.deleteOne(),
            CaseParty.deleteMany({ party_id: req.params.id })
        ]);

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        next(err);
    }
};
