const express = require('express');
const {
    getCourtrooms,
    getAvailableCourtrooms,
    createCourtroom,
    updateCourtroom,
    deleteCourtroom
} = require('../controllers/courtroomController');
const validateObjectId = require('../middleware/validateObjectId');

const router = express.Router();

router.route('/')
    .get(getCourtrooms)
    .post(createCourtroom);

router.route('/available')
    .get(getAvailableCourtrooms);

router.route('/:id')
    .put(validateObjectId, updateCourtroom)
    .delete(validateObjectId, deleteCourtroom);

module.exports = router;
