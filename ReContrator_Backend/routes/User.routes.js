var express = require('express');
var router = express.Router();

const UserController = require('../controllers/User.Controllers.js');
const verifyToken = require('../controllers/Verify.token');



router.post('/add/client', UserController.addUser);
router.get('/all/clients', UserController.findUser);
router.get("/client/:_id", UserController.findUser);
router.post('/client/login', UserController.userLogin);
router.delete('/delete/client/:id', UserController.deleteUser);
router.put("/client/update/:_id",  UserController.updateUser);
router.get('/client/info/:_id', verifyToken, UserController.getUserInfo);
router.put("/client/updatepass/:_id", UserController.ResetPass);

module.exports = router;