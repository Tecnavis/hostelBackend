const express = require('express');
const router = express.Router();
const Controller = require('../controllers/room');
const { uploadImageSingle, uploadImageArray } = require('../lib/multer');


router.post('/', uploadImageArray, Controller.create); 
router.get('/hostels/:id', Controller.getAll);
router.get("/", Controller.getAllroom);
// router.get("/active", Controller.getAllActive);
router.get('/owner/:id', Controller.getAllSuperAdminOwnerRooms);
router.get('/:id', Controller.get);
router.put('/:id', uploadImageArray, Controller.update);
router.delete('/:id/hostels/:hostelId', Controller.delete);
router.patch("/block/:id", Controller.block);
router.put("/ratings/:id", Controller.updateRating);



module.exports = router;
