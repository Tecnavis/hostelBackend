const express = require('express');
const router = express.Router();
const Controller = require('../controllers/hostel');
const { uploadImageSingle, uploadImageArray } = require('../lib/multer');


router.post('/', uploadImageArray, Controller.create); 
router.get("/", Controller.getAllhostel);
router.get('/owner/:id', Controller.getAll);
// router.get('/active', Controller.getAllActive);
router.get('/super-admin/:id', Controller.getAllSuperAdminOwner);
router.get('/:id', Controller.get);
router.put("/:id", uploadImageArray, Controller.update);
router.delete('/:id', Controller.delete);
router.patch("/block/:id", Controller.block);
router.put("/ratings/:id", Controller.updateRating);



module.exports = router;
