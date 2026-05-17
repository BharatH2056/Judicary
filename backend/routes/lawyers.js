const express = require('express');
const {
    getLawyers,
    getLawyer,
    getLawyerCases,
    createLawyer,
    updateLawyer,
    deleteLawyer
} = require('../controllers/lawyerController');
const validateObjectId = require('../middleware/validateObjectId');

const router = express.Router();

router.route('/')
    .get(getLawyers)
    .post(createLawyer);

router.route('/:id')
    .get(validateObjectId, getLawyer)
    .put(validateObjectId, updateLawyer)
    .delete(validateObjectId, deleteLawyer);

router.route('/:id/cases')
    .get(validateObjectId, getLawyerCases);

module.exports = router;
