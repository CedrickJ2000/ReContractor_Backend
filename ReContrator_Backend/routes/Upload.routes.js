var express = require('express');
var router = express.Router();


const UploadController = require('../controllers/Product.Controllers');


router.post('/upload', UploadController.UploadSingle);


module.exports = router;