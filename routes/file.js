const express = require("express");
const path = require("path");
const router = express.Router();
const FileController = require("../app/controllers/FileController");
const validator = require("../app/middlewares/validator");
const multer = require('multer')

var storage = multer.diskStorage({
  destination: (req, file, res) => {
    var pathFolder = req.headers.referer? req.headers.referer.split('=')[1] : ''
    if(pathFolder) {
      res(null,  path.join(__dirname , ".." ,`users/${req.signedCookies.UID}`,`${pathFolder}`))
    } else {
      res(null,  path.join(__dirname , ".." ,`users/${req.signedCookies.UID}`))
    }
  },
  filename: (req, file, res) => {
    res(null, file.originalname);
  },
});

var upload = multer({storage})

router.get("/", validator.isLogin, FileController.index);
router.get("/download", FileController.downloadFile);
router.get("/folder", validator.isLogin, FileController.directFolder);
router.delete("/", FileController.deleteFile);
router.post("/upload",upload.single('file'), FileController.uploadFile);
router.post("/", FileController.createFile);
router.put("/", FileController.renameFile);

module.exports = router;
