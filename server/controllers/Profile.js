const Profile = require('../models/Profile');
const User = require("../models/User");
const Course = require("../models/Course");
const CourseProgress = require("../models/CourseProgress");
const { uploadImageToCloudinary } = require("../utils/imageUploader");
const mongoose = require("mongoose");



// creating updateProfile Handler
exports.updateProfile = async (req, res) => {
    try {
        // get data
        const {dateOfBirth="", about="", contactNumber, gender} = req.body;

        // get userId
        const id = req.user.id;

        // validation
        if(!contactNumber || !gender) {
            return res.status(400).json({
                success:false,
                message:'All fields are required',
            });
        }

        // find Profile -- here first we are finding userDetails and then find profile details if that present inside userDetails
        const userDetails = await User.findById(id);
        // now here we find profile id
        const profileId = userDetails.additionalDetails; 
        // here we find all details of profile by using profile id
        const profileDetails = await Profile.findById(profileId);

        // update Profile
        profileDetails.dateOfBirth = dateOfBirth;
        profileDetails.gender = gender;
        profileDetails.about = about;
        profileDetails.contactNumber = contactNumber;
        await profileDetails.save();  // update in DB by using save() before this we use id for updation in DB

        // return response
        return res.status(200).json({
            success:true,
            message: 'Profile Updated Successfully',
            profileDetails,
        }); 
 
    } catch (error) {
        return res.status(500).json({
            success:false,
            message: 'Internal Error for Updating the Profile',
            error : error.message,
        });
    }
}



// Profile Deletion Handler
// Explore-->> How can we schedule this deletion operation
exports.deleteAccount = async (req, res) => {
    try {
        // get id
        const id = req.user.id;

        // validation
        const userDetails = await User.findById(id);
        if(!userDetails) {
            return res.status(404).json({
                success:false,
                message:'User not Found',
            });
        }

        // delete Profile -- in this first we will delete additional details then profile
        await Profile.findByIdAndDelete({_id:userDetails.additionalDetails});

        // -->>> unroll user from all enrolled courses
        await Course.updateMany(
            { studentsEnrolled: id },
            { $pull: { studentsEnrolled: id } }
        );

        // delete user entry
        await User.findByIdAndDelete({_id:id});

        // return response
        return res.status(200).json({
            success:true,
            message: 'User Profile and Account Deleted Successfully',
        }); 

    } catch (error) {
        return res.status(500).json({
            success:false,
            message: 'Something went wrong while deleting account',
            error : error.message,
        });
    }
}



// here we are getting all details of User (Handler)
 exports.getAllUserDetails = async (req, res) => {
    try {
        // get id
        const id = req.user.id;

        // validation and get user details
        const userDetails = await User.findById(id).populate("additionalDetails").exec();

        if(!userDetails) {
            return res.status(404).json({
                success:false,
                message:'User not Found',
            });
        }

        // return response
        return res.status(200).json({
            success:true,
            message: 'User Data fetched Successfully',
            userDetails,
        });

    } catch (error) {
        return res.status(500).json({
            success:false,
            message: 'Something issue for getting all data',
            error : error.message,
        });
    }
 }



 // Update profile picture Handler
 exports.updateDisplayPicture = async (req, res) => {
  try {
    const displayPicture = req.files.displayPicture
    const userId = req.user.id
    const image = await uploadImageToCloudinary(
      displayPicture,
      process.env.FOLDER_NAME,
      1000,
      1000
    )
    console.log(image)
    const updatedProfile = await User.findByIdAndUpdate(
      { _id: userId },
      { image: image.secure_url },
      { new: true }
    )
    res.send({
      success: true,
      message: `Image Updated successfully`,
      data: updatedProfile,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}