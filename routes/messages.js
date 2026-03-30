const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messages');
const { checkLogin } = require('../utils/authHandler');

router.use(checkLogin);

router.get('/', messageController.getLatestMessages);
router.post('/', messageController.createMessage);
router.get('/:userID', messageController.getMessagesBetweenUsers);

module.exports = router;
