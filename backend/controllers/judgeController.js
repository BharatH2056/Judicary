const Judge = require('../models/Judge');
const Courtroom = require('../models/Courtroom');

// @desc    Get all judges
// @route   GET /api/judges
exports.getJudges = async (req, res, next) => {
    try {
        const judges = await Judge.find().populate('courtroom_id');
        res.status(200).json({ success: true, count: judges.length, data: judges });
    } catch (err) {
        next(err);
    }
};

// @desc    Get single judge
// @route   GET /api/judges/:id
exports.getJudge = async (req, res, next) => {
    try {
        const judge = await Judge.findById(req.params.id).populate('courtroom_id');
        if (!judge) return res.status(404).json({ success: false, error: 'Judge not found' });
        res.status(200).json({ success: true, data: judge });
    } catch (err) {
        next(err);
    }
};

// @desc    Create judge
// @route   POST /api/judges
exports.createJudge = async (req, res, next) => {
  try {
    const { name, specialization, experience_yrs, courtroom_id } = req.body

    // Fix auto-generation using timestamp to avoid duplicates
    const count = await Judge.countDocuments()
    let judge_id = `J-${String(count + 1).padStart(3, '0')}`
    
    // Check if already exists and increment if needed
    const existing = await Judge.findOne({ judge_id })
    if (existing) {
      const allJudges = await Judge.find().sort({ createdAt: -1 }).limit(1)
      const lastNum = allJudges[0]?.judge_id?.split('-')[1] || '000'
      judge_id = `J-${String(parseInt(lastNum) + 1).padStart(3, '0')}`
    }

    // If courtroom is already assigned to another judge, unassign that judge first
    if (courtroom_id) {
      const currentJudge = await Judge.findOne({ courtroom_id })
      if (currentJudge) {
        await Judge.findByIdAndUpdate(currentJudge._id, { $unset: { courtroom_id: 1 } })
        await Courtroom.findByIdAndUpdate(courtroom_id, { $unset: { judge_id: 1 } })
      }
    }

    const newJudge = new Judge({
      judge_id,
      name,
      specialization,
      experience_yrs,
      courtroom_id: courtroom_id || null
    })

    await newJudge.save()

    // Link courtroom back to this judge
    if (courtroom_id) {
      await Courtroom.findByIdAndUpdate(courtroom_id, { judge_id: newJudge._id })
    }

    res.status(201).json({ success: true, data: newJudge })
  } catch (err) {
    next(err)
  }
};


// @desc    Update judge
// @route   PUT /api/judges/:id
exports.updateJudge = async (req, res, next) => {
  try {
    const { name, specialization, experience_yrs, courtroom_id } = req.body
    
    const judge = await Judge.findById(req.params.id)
    if (!judge) {
      return res.status(404).json({ success: false, error: 'Judge not found' })
    }

    // Step 1 — Clear old courtroom assignment for this judge
    if (judge.courtroom_id) {
      await Courtroom.findByIdAndUpdate(
        judge.courtroom_id, 
        { $unset: { judge_id: 1 } }
      )
    }

    // Step 2 — Clear target courtroom assignment if taken
    if (courtroom_id) {
      const currentJudge = await Judge.findOne({ courtroom_id })
      if (currentJudge && currentJudge._id.toString() !== req.params.id) {
        await Judge.findByIdAndUpdate(currentJudge._id, { $unset: { courtroom_id: 1 } })
      }
      await Courtroom.findByIdAndUpdate(courtroom_id, { $unset: { judge_id: 1 } })
    }

    // Step 3 — Update the judge with new data
    const updated = await Judge.findByIdAndUpdate(
      req.params.id,
      { 
        $set: { 
          name, 
          specialization, 
          experience_yrs,
          courtroom_id: courtroom_id || null
        } 
      },
      { new: true, runValidators: false }
    ).populate('courtroom_id')

    if (!updated) {
      return res.status(404).json({ success: false, error: 'Update failed' })
    }

    // Step 4 — Assign new courtroom to this judge
    if (courtroom_id) {
      await Courtroom.findByIdAndUpdate(
        courtroom_id,
        { $set: { judge_id: updated._id } },
        { runValidators: false }
      )
    }

    res.status(200).json({ success: true, data: updated })
  } catch (err) {
    console.error('Update judge error:', err)
    next(err)
  }
}



// @desc    Delete judge
// @route   DELETE /api/judges/:id
exports.deleteJudge = async (req, res, next) => {
    try {
        const judge = await Judge.findById(req.params.id);
        if (!judge) return res.status(404).json({ success: false, error: 'Judge not found' });

        if (judge.courtroom_id) {
            await Courtroom.findByIdAndUpdate(judge.courtroom_id, { judge_id: null });
        }

        await judge.deleteOne();

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        next(err);
    }
};
