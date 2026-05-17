const express = require('express');
const {
    getParties,
    getParty,
    getPartyCases,
    createParty,
    updateParty,
    deleteParty
} = require('../controllers/partyController');
const validateObjectId = require('../middleware/validateObjectId');

const router = express.Router();

router.route('/')
    .get(getParties)
    .post(createParty);

router.route('/:id')
    .get(validateObjectId, getParty)
    .put(validateObjectId, updateParty)
    .delete(validateObjectId, deleteParty);

router.route('/:id/cases')
    .get(validateObjectId, getPartyCases);

module.exports = router;
