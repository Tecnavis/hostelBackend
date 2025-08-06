const Blog = require("../models/blog"); 

// Create a new blog post
const createBlog = async (req, res) => {
  try {
    const { ownerId, title, photos, date, description } = req.body;

    const newBlog = new Blog({
      ownerId,
      title,
      photos,
      date,
      description,
    });

    const savedBlog = await newBlog.save();
    res.status(201).json(savedBlog);
  } catch (error) {
    res.status(500).json({ error: "Failed to create blog post" });
  }
};

// Get all blog posts
const getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().populate("ownerId");
    res.status(200).json(blogs);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch blog posts" });
  }
};

// Get a single blog post by ID
const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate("ownerId");
    if (!blog) return res.status(404).json({ error: "Blog post not found" });

    res.status(200).json(blog);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch blog post" });
  }
};

// Update a blog post
const updateBlog = async (req, res) => {
  try {
    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    if (!updatedBlog) return res.status(404).json({ error: "Blog post not found" });

    res.status(200).json(updatedBlog);
  } catch (error) {
    res.status(500).json({ error: "Failed to update blog post" });
  }
};

// Delete a blog post
const deleteBlog = async (req, res) => {
  try {
    const deletedBlog = await Blog.findByIdAndDelete(req.params.id);

    if (!deletedBlog) return res.status(404).json({ error: "Blog post not found" });

    res.status(200).json({ message: "Blog post deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete blog post" });
  }
};


// block and unblock room

const blockBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate("ownerId");

    if (!blog) {
      return res.status(404).json({ message: "blog not found" });
    }

    blog.isActive = !blog.isActive;

    await blog.save();
    const admin = await adminModel.findOne({ role: "super-admin" });

    await notficationModel.create({
      adminId: admin?._id,
      ownerId: blog?.ownerId,
      message: `${blog?.name} blog ${
        room.isActive !== true ? "blocked" : "unblocked"
      }`,
    });

    res.json({ blog, status: 200 });
  } catch (error) {
    console.error("Error in Block admin:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
  blockBlog 
};
