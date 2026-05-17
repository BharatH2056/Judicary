const express = require('express');
const {
    getAllEvidence,
    getCaseEvidence,
    getEvidence,
    createEvidence,
    updateEvidence,
    deleteEvidence
} = require('../controllers/evidenceController');
const validateObjectId = require('../middleware/validateObjectId');

const router = express.Router();

router.route('/')
    .get(getAllEvidence)
    .post(createEvidence);

router.route('/case/:caseId')
    .get(getCaseEvidence);

router.route('/:id')
    .get(validateObjectId, getEvidence)
    .put(validateObjectId, updateEvidence)
    .delete(validateObjectId, deleteEvidence);

module.exports = router;
