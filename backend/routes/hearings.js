const express = require('express');
const {
    getHearings,
    getHearing,
    getCaseHearings,
    getTodayHearings,
    createHearing,
    updateHearing,
    deleteHearing
} = require('../controllers/hearingController');
const validateObjectId = require('../middleware/validateObjectId');

const router = express.Router();

router.route('/')
    .get(getHearings)
    .post(createHearing);

router.route('/today')
    .get(getTodayHearings);

router.route('/case/:caseId')
    .get(getCaseHearings);

router.route('/:id')
    .get(validateObjectId, getHearing)
    .put(validateObjectId, updateHearing)
    .delete(validateObjectId, deleteHearing);

module.exports = router;
