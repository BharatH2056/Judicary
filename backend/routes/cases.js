const express = require('express');
const {
    getAllCases,
    getCaseById,
    getCaseFull,
    createCase,
    updateCase,
    deleteCase
} = require('../controllers/caseController');
const validateObjectId = require('../middleware/validateObjectId');

const router = express.Router();

router.route('/')
    .get(getAllCases)
    .post(createCase);

router.route('/:id')
    .get(validateObjectId, getCaseById)
    .put(validateObjectId, updateCase)
    .delete(validateObjectId, deleteCase);

router.route('/:id/full')
    .get(validateObjectId, getCaseFull);

module.exports = router;
