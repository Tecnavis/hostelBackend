const notficationModel = require("../models/notfication");



//get by admin Id not read

exports.getAdminUnread = asyncHandler(async (req, res) => {
  const notfication = await notficationModel.findById({ adminId :req.params.id,  adminIsRead: false });
  res.status(200).json(notfication);
});


//get by notfication Id not read


exports.getOwnerUnread = asyncHandler(async (req, res) => {
  const notfication = await notficationModel.findById({ ownerId :req.params.id,  ownerIsRead: false });
  res.status(200).json(notfication);
});

//get by notfication Id  read


exports.getAdminRead = asyncHandler(async (req, res) => {
  const notfication = await notficationModel.findById({ adminId :req.params.id,  adminIsRead: true });
  res.status(200).json(notfication);
});


//get by notfication Id  read


exports.getOwnerRead = asyncHandler(async (req, res) => {
  const notfication = await notficationModel.findById({ ownerId :req.params.id,  ownerIsRead: true });
  res.status(200).json(notfication);
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


