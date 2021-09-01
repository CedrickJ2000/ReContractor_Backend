
var express = require('express');
var router = express.Router();
const {upload} = require('../helpers/filehelper');
const {singleFileUpload} = require('../controllers/fileuploader.Controllers');



router.post('/singleFile', upload.single('file'), singleFileUpload);

module.exports = {
    routes: router
}
