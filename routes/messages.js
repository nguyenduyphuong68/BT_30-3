var express = require("express");
var router = express.Router();
let { checkLogin } = require('../utils/authHandler');

let messageController = require('../controllers/messages');

router.get('/', checkLogin, async function (req, res, next) {
    try {
        let result = await messageController.getLatestMessages(req.userId);
        res.send(result);
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

router.post('/', checkLogin, async function (req, res, next) {
    try {
        let result = await messageController.createMessage(
            req.userId,
            req.body.to,
            req.body.type,
            req.body.content
        );
        res.send(result);
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

router.get('/:id', checkLogin, async function (req, res, next) {
    try {
        let result = await messageController.getMessagesBetweenUsers(req.userId, req.params.id);
        res.send(result);
    } catch (error) {
        res.status(404).send({ message: "messages not found" });
    }
});

module.exports = router;
