var express = require('express');
var router = express.Router();

const EmailController = require('../controllers/UserEmail.Controllers');


router.post('/client/signup', EmailController.signup);
router.post('/client/email-activate', EmailController.activateAccount);
router.put("/client/forgot-password", EmailController.forgotPassword);
router.put("/client/reset-password", EmailController.resetPassword);


module.exports = router;