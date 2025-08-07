const Blog = require("../models/blog");
const adminModel = require("../models/admin");
const notficationModel = require("../models/notfication");

// Create a new blog post
const createBlog = async (req, res) => {
  try {
    const { ownerId, title, date, description, sections } = req.body;


    if (!ownerId || !title || !description || !date || !sections) {
      return res.status(400).json({ message: "Please add all fields" });
    }

    let parsedSections = sections;

    if (typeof sections === "string") {
      try {
        parsedSections = JSON.parse(sections);
      } catch (error) {
        return res.status(400).json({ message: "Invalid format for sections" });
      }
    }

    const images = req.cloudinaryImageUrl;

    if (!images.length) {
      return res.status(400).json({ message: "No images uploaded" });
    }

    const newBlog = new Blog({
      ownerId,
      title,
      date,
      description,
      photos: images,
      sections: parsedSections,
    });

    const savedBlog = await newBlog.save();
    res.status(201).json({ savedBlog, status: 201 });
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
    const blogId = req.params.id;
    const newImages = req.cloudinaryImageUrl || [];

    // Find the existing blog first
    const existingBlog = await Blog.findById(blogId);
    if (!existingBlog) {
      return res.status(404).json({ error: "Blog post not found" });
    }

    // Merge existing photos with new images
    let finalPhotos = existingBlog.photos || [];
    if (newImages.length > 0) {
      finalPhotos = finalPhotos.concat(newImages);
    }

    // Update the blog fields
    const updatedData = {
      ...req.body,
      photos: finalPhotos,
    };

    const updatedBlog = await Blog.findByIdAndUpdate(blogId, updatedData, {
      new: true,
    });

    res.status(200).json(updatedBlog);
  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({ error: "Failed to update blog post" });
  }
};

// Delete a blog post
const deleteBlog = async (req, res) => {
  try {
    const deletedBlog = await Blog.findByIdAndDelete(req.params.id);

    if (!deletedBlog)
      return res.status(404).json({ error: "Blog post not found" });

    res
      .status(200)
      .json({ message: "Blog post deleted successfully", status: 200 });
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
        blog.isActive !== true ? "blocked" : "unblocked"
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
  blockBlog,
};
