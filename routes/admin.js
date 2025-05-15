const express = require('express');
const router = express.Router();
const Controller = require('../controllers/admin');
const { uploadImageSingle } = require('../lib/multer');


router.post('/',  Controller.create); 
router.get('/', Controller.getAll);
router.get('/:id', Controller.get);
router.put('/:id', uploadImageSingle, Controller.update);
router.delete('/:id', Controller.delete);
// router.post("/login", Controller.login);
// router.put("/logout/:id", Controller.logout);



module.exports = router;
