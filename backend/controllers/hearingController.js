const Hearing = require('../models/Hearing');

// @desc    Get all hearings
// @route   GET /api/hearings
exports.getHearings = async (req, res, next) => {
  try {
    const hearings = await Hearing.find()
      .populate('case_id', 'case_id title type status')
      .populate('judge_id', 'name specialization')
      .populate('courtroom_id', 'room_id room_no floor')
      .sort({ date: 1 })

    res.status(200).json({
      success: true,
      count: hearings.length,
      data: hearings
    })
  } catch (err) {
    next(err)
  }
};

// @desc    Get single hearing
// @route   GET /api/hearings/:id
exports.getHearing = async (req, res, next) => {
    try {
        const hearing = await Hearing.findById(req.params.id).populate('case_id judge_id courtroom_id');
        if (!hearing) return res.status(404).json({ success: false, error: 'Hearing not found' });
        res.status(200).json({ success: true, data: hearing });
    } catch (err) {
        next(err);
    }
};

// @desc    Get hearings for a case
// @route   GET /api/hearings/case/:caseId
exports.getCaseHearings = async (req, res, next) => {
    try {
        const hearings = await Hearing.find({ case_id: req.params.caseId }).populate('judge_id courtroom_id');
        res.status(200).json({ success: true, count: hearings.length, data: hearings });
    } catch (err) {
        next(err);
    }
};

// @desc    Get hearings for today
// @route   GET /api/hearings/today
exports.getTodayHearings = async (req, res, next) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const hearings = await Hearing.find({
            date: { $gte: today, $lt: tomorrow }
        }).populate('case_id judge_id courtroom_id');

        res.status(200).json({ success: true, count: hearings.length, data: hearings });
    } catch (err) {
        next(err);
    }
};

// @desc    Schedule hearing
// @route   POST /api/hearings
exports.createHearing = async (req, res, next) => {
  try {
    const { case_id, judge_id, courtroom_id, date, time, outcome, notes } = req.body

    // Generate clean hearing_id with collision-safe fallback
    const count = await Hearing.countDocuments()
    let hearing_id = `H-${String(count + 1).padStart(3, '0')}`

    // If that ID already exists, find the highest and increment
    const existing = await Hearing.findOne({ hearing_id })
    if (existing) {
      const last = await Hearing.findOne({ hearing_id: /^H-\d+$/ }).sort({ hearing_id: -1 })
      const lastNum = last ? parseInt(last.hearing_id.split('-')[1]) : count
      hearing_id = `H-${String(lastNum + 1).padStart(3, '0')}`
    }

    const newHearing = new Hearing({
      hearing_id,
      case_id,
      judge_id,
      courtroom_id,
      date,
      time,
      outcome: outcome || 'Scheduled',
      notes
    })

    await newHearing.save()

    res.status(201).json({
      success: true,
      data: newHearing
    })
  } catch (err) {
    next(err)
  }
};

// @desc    Update hearing
// @route   PUT /api/hearings/:id
exports.updateHearing = async (req, res, next) => {
    try {
        const hearing = await Hearing.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!hearing) return res.status(404).json({ success: false, error: 'Hearing not found' });

        res.status(200).json({ success: true, data: hearing });
    } catch (err) {
        next(err);
    }
};

// @desc    Cancel hearing
// @route   DELETE /api/hearings/:id
exports.deleteHearing = async (req, res, next) => {
    try {
        const hearing = await Hearing.findById(req.params.id);
        if (!hearing) return res.status(404).json({ success: false, error: 'Hearing not found' });

        await hearing.deleteOne();

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        next(err);
    }
};
