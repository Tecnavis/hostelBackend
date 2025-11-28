const UserModel = require("../models/user");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer =  require("nodemailer");
const otpStorage = new Map();
const twilio = require("twilio");

require("dotenv").config();


const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN );





//create user
exports.create = asyncHandler(async (req, res) => {
  const { name, email, password,  phone } = req.body.data;

  if (!name || !email || !password ||!phone) {
    return res.status(400).json({ message: "Please add all fields" });
  }

  // Check  email or phone already exists
  const userExists = await UserModel.findOne({
    $or: [{ email: email }],
  });

  if (userExists) {
    if (userExists.email === email) {
      return res.status(400).json({ message: "Email already exists" });
    }
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await UserModel.create({
    name,
    email,
    password: hashedPassword,
    phone,
  });

  if (user) {
    return res.status(201).json({ message: "User created", status: 201 });
  } else {
    return res.status(400).json({ message: "User not created" });
  }
});



exports.login = asyncHandler(async (req, res) => {
  
  let { phone } = req.body.data;

  
    
  // Check if customer exists
  const user = await UserModel.findOne({ phone });
  
  
  
  if (!user) {
    return res.status(400).json({ message: "Phone number not registered" });
  }
  // Ensure +91 prefix with space
  if (!phone.startsWith("+91")) {
    phone = "+91 " + phone.replace(/^\+91\s*/, "").trim();
  }
  

  // Generate OTP (6-digit random number)
  const otp = Math.floor(100000 + Math.random() * 900000);
  otpStorage.set(phone, otp); // Store OTP temporarily

  // Send OTP via Twilio
  try {
    await client.messages.create({
      body: `Your verification code is: ${otp}`,
      from: process.env.TWLIO_NUMBER,
      to: phone,
    });

  
    res.status(200).json({ message: "OTP sent successfully" , status: 200});
  } catch (error) {
    console.error("Twilio Error:", error);
    res.status(500).json({ message: "Failed to send OTP" });
  }
});


exports.verifyOtp = asyncHandler(async (req, res) => {
  try {
    const { phone, otp } = req.body.data;    

    if (!phone || !otp) {
      return res.status(400).json({ message: "Phone and OTP are required" });
    }

    // Ensure +91 prefix
    const formattedPhone = phone.startsWith("+91")
      ? phone
      : "+91 " + phone.replace(/^\+91\s*/, "").trim();

    // Validate OTP
    const storedOtp = otpStorage.get(formattedPhone);
    if (!storedOtp || storedOtp != otp) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Remove OTP from storage
    otpStorage.delete(formattedPhone);

    // Find customer
    const user = await UserModel.findOne({ phone: phone });
    if (!user) {
      return res.status(400).json({ message: "Customer not found" });
    }
  
          const token = jwt.sign(
        { email: user.email, id: user._id },
        "myjwtsecretkey",
        { expiresIn: "1h" }
      );


      const userDetails = {
        name: user.name,
        email: user.email,
        _id: user._id,
        phone: user.phone,
        image: user?.image,
      };

      return res.status(200).json({  message: "OTP verified successfully", token, userDetails, status: 200 });


  } catch (err) {
    console.error("Verify OTP error:", err);
    return res.status(500).json({ error: "Server error, please try again" });
  }
});


// get all
exports.getAll = asyncHandler(async (req, res) => {
  const user = await UserModel.find();
  res.status(200).json(user);
});

//get by Id
exports.get = asyncHandler(async (req, res) => {
  const user = await UserModel.findById(req.params.id);
  res.status(200).json(user);
});

//delete admin
exports.delete = asyncHandler(async (req, res) => {
  await UserModel.findByIdAndDelete(req.params.id);
  res.status(200).json({ message: "User deleted" });
});

// Update user (partial update)
exports.update = asyncHandler(async (req, res) => {
  

  const { name, email,  proof, phone,   existingPhotos  } = req.body;
  

  // const image = req.file?.filename;
  const image = req.cloudinaryImageUrl

  const user = await UserModel.findById(req.params.id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // If email is changing, check if new email already exists
  if (email && email !== user.email) {
    const emailExists = await UserModel.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: "Email already exists" });
    }
  }

  // Update only the fields provided
  if (name) user.name = name;
  if (email) user.email = email;
  if (proof) {
    if (proof.frond) user.proof.frond = image;
    if (proof.back) user.proof.back = image;
  }
  if (image) user.image = image;
  if(phone) user.phone = phone;
if (existingPhotos && existingPhotos !== "{}") {
  // remove wrapping quotes if present
  const cleanPhoto = existingPhotos.replace(/^"(.*)"$/, "$1");
  
  user.image = cleanPhoto;
}

  const updatedUser = await user.save();

  res
    .status(200)
    .json({
      message: "User updated successfully",
      user: updatedUser,
      status: 200,
    });
});





exports.sendMail = async (req, res) => {
  try {
    const { name, phone, email, message } = req.body;
  


    const cleanedPhone = phone.startsWith("0") ? phone.slice(1) : phone;
    if (!/^\d{10}$/.test(cleanedPhone)) {
      return res.status(400).json({ message: "Phone number must be exactly 10 digits" });
    }

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and message are required fields."
      });
    }

    // Configure transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Define mail options for admin notification
    const adminMailOptions = {
      from: email, // Visitor's email as sender
      to: "hostahealthcare@gmail.com", // Your admin email
      subject: `New Contact Form Submission from ${name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
        <hr>
        <p>This message was sent from your website contact form.</p>
      `
    };

    // Define mail options for auto-reply to user
    const userMailOptions = {
      from: "hostahealthcare@gmail.com",
      to: email,
      subject: "Thank you for contacting Hostay",
      html: `
        <h2>Thank you for your message!</h2>
        <p>Dear ${name},</p>
        <p>We have received your message and will get back to you within 24 hours.</p>
        <p><strong>Your message:</strong></p>
        <p>${message}</p>
        <hr>
        <p>Best regards,<br>Hostay Team</p>
        <p>Phone: +919496086080<br>Email: Hostayofficial@gmail.com</p>
      `
    };

    // Send email to admin
    const adminInfo = await transporter.sendMail(adminMailOptions);
    console.log('Admin email sent:', adminInfo.response);

    // Send auto-reply to user
    const userInfo = await transporter.sendMail(userMailOptions);
    console.log('User auto-reply sent:', userInfo.response);

    // Respond with success message
    return res.status(200).json({
      success: true,
      message: "Email sent successfully! We'll get back to you soon.",
      info: adminInfo.response
    });

  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({
      success: false,
      message: "Failed to send email. Please try again later.",
      error: error.message
    });
  }
};