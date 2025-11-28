const express = require('express');
const router = express.Router();
const Controller = require('../controllers/user');
const { uploadImageSingle } = require('../lib/multer');


router.post('/',  Controller.create); 
router.get('/', Controller.getAll);
router.get('/:id', Controller.get);
router.put('/:id', uploadImageSingle, Controller.update);
router.delete('/:id', Controller.delete);
router.post("/login", Controller.login);
router.post("/otp", Controller.verifyOtp);
router.post("/email", Controller.sendMail);






module.exports = router;
