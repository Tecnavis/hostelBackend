const express = require("express");
const router = express.Router();
const blogController = require("../controllers/blog");

router.post("/", blogController.createBlog);
router.get("/", blogController.getAllBlogs);
router.get("/:id", blogController.getBlogById);
router.put("/:id", blogController.updateBlog);
router.delete("/:id", blogController.deleteBlog);
router.patch("/block/:id", blogController.blockBlog);


module.exports = router;
