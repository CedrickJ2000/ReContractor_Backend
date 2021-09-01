var express = require('express');
var router = express.Router();

const ContractorController = require('../controllers/ContractorEmail.Controllers');


router.post('/contractor/signup', ContractorController.signup);
router.post('/contractor/email-activate', ContractorController.activateAccount);
router.put("/contractor/forgot-password", ContractorController.forgotPassword);
router.put("/contractor/reset-password", ContractorController.resetPassword);


module.exports = router;