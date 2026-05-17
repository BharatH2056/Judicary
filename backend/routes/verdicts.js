const express = require('express');
const {
    getVerdicts,
    getVerdict,
    getCaseVerdict,
    createVerdict,
    updateVerdict,
    deleteVerdict
} = require('../controllers/verdictController');
const validateObjectId = require('../middleware/validateObjectId');

const router = express.Router();

router.route('/')
    .get(getVerdicts)
    .post(createVerdict);

router.route('/case/:caseId')
    .get(getCaseVerdict);

router.route('/:id')
    .get(validateObjectId, getVerdict)
    .put(validateObjectId, updateVerdict)
    .delete(validateObjectId, deleteVerdict);

module.exports = router;
