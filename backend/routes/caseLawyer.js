const express = require('express');
const {
    getCaseLawyers,
    assignLawyerToCase,
    removeLawyerFromCase
} = require('../controllers/caseLawyerController');

const router = express.Router();

router.route('/')
    .post(assignLawyerToCase)
    .delete(removeLawyerFromCase);

router.route('/:caseId')
    .get(getCaseLawyers);

module.exports = router;
