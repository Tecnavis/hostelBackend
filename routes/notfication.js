const express = require('express');
const router = express.Router();
const Controller = require('../controllers/notification');


router.get('/super-admin/no-read/:id', Controller.getAdminUnread);
router.get('/super-owner/no-read/:id', Controller.getOwnerUnread);

router.get('/super-admin/read/:id', Controller.getAdminRead);
router.get('/super-owner/read/:id', Controller.getOwnerRead);

router.patch('/super-admin/:id', Controller.updateAdmin);
router.patch('/super-owner/:id', Controller.updateOwner);



module.exports = router;
