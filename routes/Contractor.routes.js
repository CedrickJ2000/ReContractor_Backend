var express = require('express');
var router = express.Router();

const ContractorController = require('../controllers/Contractor.Controllers.js');
const verifyToken = require('../controllers/Verify.token');



router.post('/add/contractor', ContractorController.addUser);
router.get('/all/contractors', ContractorController.findUser);
router.get("/contractor/:_id", ContractorController.findUser);
router.post('/contractor/login', ContractorController.userLogin);
router.delete('/delete/contractor/:id', ContractorController.deleteUser);
router.put("/contractor/update/:_id",  ContractorController.updateUser);
router.get('/contractor/info/:_id', verifyToken, ContractorController.getUserInfo);
router.put("/contractor/updatepass/:_id", ContractorController.ResetPass);

module.exports = router;