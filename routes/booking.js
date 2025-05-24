const express = require('express');
const router = express.Router();
const Controller = require('../controllers/booking');


router.post('/',  Controller.create); 
router.get("/", Controller.getAllbooking);
router.get('/owner/:id', Controller.getAll);
router.get('/super-admin/:id', Controller.getAllSuperAdminBookings);
router.get('/:id', Controller.get);
router.put('/:id',  Controller.update);
router.delete('/:id', Controller.delete);


module.exports = router;
