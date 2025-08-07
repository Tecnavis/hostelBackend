const express = require("express");
const router = express.Router();
const blogController = require("../controllers/blog");
const { uploadImageArray } = require("../lib/multer");

router.post("/", uploadImageArray, blogController.createBlog);
router.get("/", blogController.getAllBlogs);
router.get("/:id", blogController.getBlogById);
router.put("/:id", uploadImageArray, blogController.updateBlog);
router.delete("/:id", blogController.deleteBlog);
router.patch("/block/:id", blogController.blockBlog);


module.exports = router;
