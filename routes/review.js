const express = require("express");
const router = express.Router();
const Controller = require("../controllers/review");

router.post("/", Controller.createreview);
router.get("/", Controller.getreviews);
router.get("/:id", Controller.getreviewById);
router.put("/:id", Controller.updatereview);
router.delete("/:id", Controller.deletereview);

module.exports = router;
