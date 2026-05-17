const express = require('express');
const {
    getJudges,
    getJudge,
    createJudge,
    updateJudge,
    deleteJudge
} = require('../controllers/judgeController');
const validateObjectId = require('../middleware/validateObjectId');

const router = express.Router();

router.route('/')
    .get(getJudges)
    .post(createJudge);

router.route('/:id')
    .get(validateObjectId, getJudge)
    .put(validateObjectId, updateJudge)
    .delete(validateObjectId, deleteJudge);

module.exports = router;
