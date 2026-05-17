const Case = require('../models/Case');
const Hearing = require('../models/Hearing');
const Evidence = require('../models/Evidence');
const Verdict = require('../models/Verdict');
const CaseParty = require('../models/CaseParty');
const CaseLawyer = require('../models/CaseLawyer');

// @desc    Get all cases
// @route   GET /api/cases
exports.getAllCases = async (req, res, next) => {
  try {
    const { search, type, status, sort, page = 1, limit = 100 } = req.query

    let query = {}

    if (search) {
      query.$or = [
        { title:   { $regex: search, $options: 'i' } },
        { case_id: { $regex: search, $options: 'i' } },
        { type:    { $regex: search, $options: 'i' } },
        { status:  { $regex: search, $options: 'i' } },
        { notes:   { $regex: search, $options: 'i' } }
      ]
    }

    if (type   && type   !== 'all') query.type   = type
    if (status && status !== 'all') query.status = status

    let sortOption = { case_id: 1 }
    if (sort === 'filing_date') sortOption = { filing_date: -1 }
    if (sort === 'title')       sortOption = { title: 1 }
    if (sort === 'case_id')     sortOption = { case_id: 1 }

    const skip  = (parseInt(page) - 1) * parseInt(limit)
    const total = await Case.countDocuments(query)
    const cases = await Case.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit))

    res.status(200).json({
      success: true,
      count: cases.length,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      },
      data: cases
    })
  } catch (err) {
    next(err)
  }
};

// @desc    Get single case
// @route   GET /api/cases/:id
exports.getCaseById = async (req, res, next) => {
    try {
        const caseRecord = await Case.findById(req.params.id);

        if (!caseRecord) {
            return res.status(404).json({ success: false, error: 'Case not found' });
        }

        res.status(200).json({ success: true, data: caseRecord });
    } catch (err) {
        next(err);
    }
};

// @desc    Get full case details
// @route   GET /api/cases/:id/full
exports.getCaseFull = async (req, res, next) => {
    try {
        const caseRecord = await Case.findById(req.params.id);

        if (!caseRecord) {
            return res.status(404).json({ success: false, error: 'Case not found' });
        }

        const [hearings, evidence, verdict, caseParties, caseLawyers] = await Promise.all([
            Hearing.find({ case_id: req.params.id }).populate('judge_id courtroom_id'),
            Evidence.find({ case_id: req.params.id }),
            Verdict.findOne({ case_id: req.params.id }),
            CaseParty.find({ case_id: req.params.id }).populate('party_id'),
            CaseLawyer.find({ case_id: req.params.id }).populate('lawyer_id')
        ]);

        res.status(200).json({
            success: true,
            data: {
                case: caseRecord,
                hearings,
                evidence,
                verdict,
                parties: caseParties,
                lawyers: caseLawyers
            }
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Create new case
// @route   POST /api/cases
exports.createCase = async (req, res, next) => {
  try {
    const { title, type, status, filing_date, notes } = req.body

    // Find the highest existing case_id number
    const lastCase = await Case.findOne()
      .sort({ createdAt: -1 })
      .select('case_id')

    let nextNum = 1001
    if (lastCase && lastCase.case_id) {
      const lastNum = parseInt(lastCase.case_id.replace('C-', ''))
      if (!isNaN(lastNum)) {
        nextNum = lastNum + 1
      }
    }

    // Keep incrementing until we find one that doesn't exist
    let case_id = `C-${nextNum}`
    let exists = await Case.findOne({ case_id })
    while (exists) {
      nextNum++
      case_id = `C-${nextNum}`
      exists = await Case.findOne({ case_id })
    }

    const newCase = new Case({
      case_id,
      title,
      type,
      status: status || 'Open',
      filing_date,
      notes: notes || ''
    })

    await newCase.save()

    res.status(201).json({
      success: true,
      data: newCase
    })

  } catch (err) {
    next(err)
  }
};

// @desc    Update case
// @route   PUT /api/cases/:id
exports.updateCase = async (req, res, next) => {
    try {
        const caseRecord = await Case.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!caseRecord) {
            return res.status(404).json({ success: false, error: 'Case not found' });
        }

        res.status(200).json({ success: true, data: caseRecord });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete case
// @route   DELETE /api/cases/:id
exports.deleteCase = async (req, res, next) => {
    try {
        const caseRecord = await Case.findById(req.params.id);

        if (!caseRecord) {
            return res.status(404).json({ success: false, error: 'Case not found' });
        }

        // Cascade delete
        await Promise.all([
            caseRecord.deleteOne(),
            Hearing.deleteMany({ case_id: req.params.id }),
            Evidence.deleteMany({ case_id: req.params.id }),
            CaseParty.deleteMany({ case_id: req.params.id }),
            CaseLawyer.deleteMany({ case_id: req.params.id }),
            Verdict.deleteMany({ case_id: req.params.id })
        ]);

        res.status(200).json({ success: true, data: {}, message: "Case and all related records deleted" });
    } catch (err) {
        next(err);
    }
};
