const express = require('express');
const {
    getCaseParties,
    linkPartyToCase,
    unlinkPartyFromCase
} = require('../controllers/casePartyController');

const router = express.Router();

router.route('/')
    .post(linkPartyToCase)
    .delete(unlinkPartyFromCase);

router.route('/:caseId')
    .get(getCaseParties);

module.exports = router;
