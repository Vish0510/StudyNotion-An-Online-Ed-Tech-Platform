const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require('bcrypt');


// resetPasswordToken  OR send email
exports.resetPasswordToken = async (req, res) => {
    try {
        // get email from req body
        const email = req.body.email;

        // check user for given email, email validation - here check user exists or not
        const user = await User.findOne({email: email});

        if(!user){
            return res.status(404).json({
                success:false,
                message:"User not found with this email",
            });
        }

        // generate token for reset password
        const token = crypto.randomUUID();

        // update user by adding token and expiry time
        const updatedDetails = await User.findOneAndUpdate({email: email}, {
            token : token,
            resetPasswordExpires: Date.now() + 10*60*1000, // 10 minutes
        },
        {new: true});   // to return updated document

        // create url
        // here we create a frontend link for reset password
        const url = `http://localhost:3000/update-password/${token}`;

        // send mail to user should be contain the link/url
        await mailSender(email, 
                        "Password Reset Link - StudyNotion",     // subject
                        `Password reset link (valid for 10 minutes) : ${url}`);   // message

        // return response
        return res.status(200).json({
            success:true,
            message:"Password reset link sent to your email successfully, please check your email and reset your password within 10 minutes",
        });

    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Something went wrong in send resetPassword mail",
        });
    }
}


// resetPassword for update DB

exports.resetPassword = async (req, res) => {
    try {
        // fetch data
        const {password, confirmPassword, token} = req.body;   // token from params or body

        // validation
        if(password !== confirmPassword) {
            return res.status(400).json({
                success:false,
                message:"Password and Confirm Password is not matching",
            });
        }

        // get userdetails from DB using token 
        const userDetails = await User.findOne({token: token});

        // if no entry - invalid token
        if(!userDetails) {
            return res.status(400).json({
                success:false,
                message:"Invalid token, user details not found",
            });
        }

        // check for token expiry time
        if(userDetails.resetPasswordExpires < Date.now()) {
            return res.status(400).json({
                success:false,
                message:"Token expired, please try again",
            });
        }

        // hash the new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // update user password in DB
        await User.findOneAndUpdate({token: token}, 
                                    {password: hashedPassword}, {new:true});

        // return response
        return res.status(200).json({
            success:true,
            message:'Password Reset Successfully',
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Something went wrong in resetPassword",
        });
    }
}