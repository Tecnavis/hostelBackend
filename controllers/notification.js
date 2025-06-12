const notficationModel = require("../models/notfication");
const asyncHandler = require("express-async-handler");




//get by admin Id not read

exports.getAdminUnread = asyncHandler(async (req, res) => {

  
  const notifications = await notficationModel.find({
    adminId: req.params.id,
    adminIsRead: false,
  }).sort({ createdAt: -1 });;

  res.status(200).json(notifications);
});



//get by notfication Id not read


exports.getOwnerUnread = asyncHandler(async (req, res) => {

   const notifications = await notficationModel.find({
     ownerId: req.params.id,
    ownerIsRead: false,
  }).sort({ createdAt: -1 });;

  res.status(200).json(notifications);
});

//get by notfication Id  read


exports.getAdminRead = asyncHandler(async (req, res) => {

   const notifications = await notficationModel.find({
    adminId: req.params.id,
    adminIsRead: true,
  }).sort({ createdAt: -1 });;


  res.status(200).json(notifications);
});


//get by notfication Id  read


exports.getOwnerRead = asyncHandler(async (req, res) => {

     const notifications = await notficationModel.find({
     ownerId: req.params.id,
    ownerIsRead: true,
  }).sort({ createdAt: -1 });;


  res.status(200).json(notifications);
});


// update admin

exports.updateAdmin = asyncHandler(async (req, res) => {

   const updatedNotification = await notficationModel.findByIdAndUpdate(
    req.params.id,
    { adminIsRead: true },
    { new: true } 
  );

  res.status(200).json({status: 200,  updatedNotification });
});

// update owner

exports.updateOwner = asyncHandler(async (req, res) => {
 const updatedNotification = await notficationModel.findByIdAndUpdate(
    req.params.id,
    {  ownerIsRead: true },
    { new: true } 
  );
  
  res.status(200).json({status: 200, updatedNotification});
});


