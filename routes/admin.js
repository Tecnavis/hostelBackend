const express = require('express');
const router = express.Router();
const Controller = require('../controllers/admin');
const { uploadImageSingle } = require('../lib/multer');


router.post('/',  Controller.create); 
router.get('/super-admins/:id', Controller.getAll);
router.get('/:id', Controller.get);
router.put('/:id', Controller.update);
router.delete('/:id', Controller.delete);
router.patch("/block/:id", Controller.block);
router.post("/login", Controller.login);



module.exports = router;
