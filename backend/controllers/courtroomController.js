const Courtroom = require('../models/Courtroom');

// @desc    Get all courtrooms
// @route   GET /api/courtrooms
exports.getCourtrooms = async (req, res, next) => {
    try {
        const courtrooms = await Courtroom.find().populate('judge_id');
        res.status(200).json({ success: true, count: courtrooms.length, data: courtrooms });
    } catch (err) {
        next(err);
    }
};

// @desc    Get available courtrooms
// @route   GET /api/courtrooms/available
exports.getAvailableCourtrooms = async (req, res, next) => {
    try {
        const courtrooms = await Courtroom.find({ judge_id: { $exists: false } });
        res.status(200).json({ success: true, count: courtrooms.length, data: courtrooms });
    } catch (err) {
        next(err);
    }
};

// @desc    Create courtroom
// @route   POST /api/courtrooms
exports.createCourtroom = async (req, res, next) => {
    try {
        const courtroom = await Courtroom.create(req.body);
        res.status(201).json({ success: true, data: courtroom });
    } catch (err) {
        next(err);
    }
};

// @desc    Update courtroom
// @route   PUT /api/courtrooms/:id
exports.updateCourtroom = async (req, res, next) => {
    try {
        const courtroom = await Courtroom.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!courtroom) return res.status(404).json({ success: false, error: 'Courtroom not found' });

        res.status(200).json({ success: true, data: courtroom });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete courtroom
// @route   DELETE /api/courtrooms/:id
exports.deleteCourtroom = async (req, res, next) => {
    try {
        const courtroom = await Courtroom.findById(req.params.id);
        if (!courtroom) return res.status(404).json({ success: false, error: 'Courtroom not found' });

        await courtroom.deleteOne();

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        next(err);
    }
};
