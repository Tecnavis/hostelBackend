const express = require('express');
const router = express.Router();
const Controller = require('../controllers/owner');


router.post('/',  Controller.create); 
router.get("/", Controller.getAllOwner);
router.get('/super-admin/:id', Controller.getAllSuperAdminOwner);
router.get('/super-owner/:id', Controller.getAll);
router.get('/:id', Controller.get);
router.put('/:id',  Controller.update);
router.delete('/:id', Controller.delete);
router.patch("/block/:id", Controller.block);
router.post("/login", Controller.login);


module.exports = router;
