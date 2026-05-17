const Case = require('../models/Case');
const Hearing = require('../models/Hearing');
const Verdict = require('../models/Verdict');

// @desc    Get dashboard stats
// @route   GET /api/dashboard/stats
exports.getDashboardStats = async (req, res, next) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
        const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);

        const [
            totalCases,
            openCases,
            hearingsToday,
            verdictsThisMonth,
            casesByType,
            recentCases,
            upcomingHearings
        ] = await Promise.all([
            Case.countDocuments(),
            Case.countDocuments({ status: 'Open' }),
            Hearing.countDocuments({ date: { $gte: today, $lt: tomorrow } }),
            Verdict.countDocuments({ verdict_date: { $gte: firstDayOfMonth, $lte: lastDayOfMonth } }),
            Case.aggregate([
                { $group: { _id: "$type", count: { $sum: 1 } } }
            ]),
            Case.find().sort('-createdAt').limit(5),
            Hearing.find({ date: { $gte: today } }).sort('date').limit(5).populate('case_id judge_id')
        ]);

        // Format caseTypeBreakdown
        const caseTypeBreakdown = { Criminal: 0, Civil: 0, Family: 0, Corporate: 0 };
        casesByType.forEach(item => {
            if (caseTypeBreakdown.hasOwnProperty(item._id)) {
                caseTypeBreakdown[item._id] = item.count;
            }
        });

        res.status(200).json({
            success: true,
            data: {
                totalCases,
                openCases,
                hearingsToday,
                verdictsThisMonth,
                caseTypeBreakdown,
                recentCases,
                upcomingHearings
            }
        });
    } catch (err) {
        next(err);
    }
};
