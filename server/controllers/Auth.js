const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt"); 
const jwt = require("jsonwebtoken");
const mailSender = require("../utils/mailSender");
const {passwordUpdate} = require("../mail/templates/passwordUpdate");
const Profile = require("../models/Profile");
require("dotenv").config();



// send OTP 
exports.sendOTP = async (req, res) => {
    try {
        // fetch email from req body
        const {email} = req.body;

        // check if user already exists
        const checkUserPresent = await User.findOne({email});

        // if user exists, then return a response
        if(checkUserPresent) {
            return res.status(401).json({
                success:false,
                message:"User already registered",
            })
        }

        // generate OTP
        var otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });

        console.log("OTP Generated", otp);

        // check unique OTP or not
        let result = await OTP.findOne({otp: otp});
        console.log("Result is Generate OTP Func");
        console.log("OTP", otp);
        console.log("Result", result);

        while(result) {
            otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });

            result = await OTP.findOne({otp: otp});
        }

        // save OTP to DB 
        const otpPayload = {email, otp};

        // create OTP entry in DB
        const otpBody = await OTP.create(otpPayload);
        console.log(otpBody);

        // return response successfully
        res.status(200).json({
            success:true,
            message:"OTP sent successfully",
            otp,  // remove this field in production
        });

    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Error in sending OTP",
        })
    }
};


// SignUp Controller for registering user
exports.signUP = async (req, res) => {
    try {
        // fetch data from req body
        const {firstName, lastName, email, password, confirmPassword, accountType, contactNumber, otp} = req.body;

        // validate user data
        if(!firstName || !lastName || !email || !password || !confirmPassword || !otp) {
            return res.status(403).json({
                success:false,
                message:"All fields are required",
            });
        }

        // 2 passwords are same or not
        if(password !== confirmPassword) {
            return res.status(400).json({
                success:false,
                message:"Password and Confirm Password do not match, Please try again",
            });
        }

        // check if user already exists or not
        const existingUser = await User.findOne({email});

        if(existingUser) {
            return res.status(400).json({
                success:false,
                message:"User already registered, Please login",
            });
        }

        // find most recent OTP stored for the user
        const recentOtp = await OTP.find({email}).sort({createdAt:-1}).limit(1);
        console.log(recentOtp);

        // validate OTP
        if(recentOtp.length === 0) {
            // means no OTP found for the email
            return res.status(400).json({
                success:false,
                message:"OTP not found, Please request for new OTP",
            });
        } else if(otp !== recentOtp[0].otp) {
            // Invalid OTP
            return res.status(400).json({
                success:false,
                message:"Invalid OTP, Please try again",
            });
        }

        // hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // create user entry in DB
        const profileDetails = await Profile.create({
            gender:null,
            dateOfBirth:null,
            about:null,
            contactNUmber : null,
        });

        const user = await User.create({
            firstName,
            lastName,
            email,
            password:hashedPassword,    
            accountType,
            additionalDetails: profileDetails._id,         // for additional details we need profileDetails  
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,          // here we insert a url of default image so we will use a 3rd party service (dicebear)
        })

        // return response successfully
        return res.status(200).json({
            success:true,
            message:"User registered successfully",
            user,
        });
    }

    catch(error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Error in SignUp, Please try again",
        });
    }
}


// Login Conrollers for authenticate user
exports.login = async (req, res) => {
    try {
        // fetch data from req body
        const {email, password} = req.body;

        // validate user data
        if(!email || !password) {
            return res.status(403).json({
                success:false,
                message:"All fields are required, please try again",
            });
        }

        // check if user exists or not
        const user = await User.findOne({email}).populate("additionalDetails");
        if(!user) {
            return res.status(404).json({
                success:false,
                message:"User not found, Please sign up",
            });
        }

        // generate JWT token, after password match  for password match we will use bcrypt.compare()
        if(await bcrypt.compare(password, user.password)) {
            // here we will create payload for jwt token
            const payload = {
                email: user.email,
                id: user._id,
                accountType : user.accountType,
            };
            // create jwt token
            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: '1d',
            });

            user.token = token;
            // remove password from user object before sending response
            user.password = undefined;
        

            // create cookie and send response
            // HERE we will set options for cookie
            const options = {
                expires: new Date(Date.now() + 3*24*60*60*1000),   // cookie will expire in 3 days
                httpOnly: true,    // cookie cannot be accessed by client side scripts
            }
            res.cookie("token", token, options).status(200).json({
                success:true,
                token,
                user,
                message:"User logged in successfully",
            })
        }
        else {
            return res.status(401).json({
                success:false,
                message:"Password is incorrect, Please try again",
            });
        }
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Error in login, Please try again",
        })
    }
};


// change password Controller
exports.changePassword = async (req, res) => {
    try {
        //1. fetch data from req body
        const userId = req.user.id;

        //2. get old password, new password, confirm new password
        const {oldPassword, newPassword, confirmNewPassword} = req.body;

        //3. validation old password 
        if(!oldPassword || !newPassword || !confirmNewPassword) {
            return res.status(400).json({
                success:false,
                message:"All fields are required, please try again",
            });
        }
        // check new password and confirm new password
        if(newPassword !== confirmNewPassword) {
            return res.status(400).json({
                success:false,
                message:"New Password and Confirm New Password do not match, please try again",
            });
        }
        
        //4. fetch user details from DB
        const userDetails = await User.findById(userId);
        if(!userDetails) {
            return res.status(404).json({
                success:false,
                message:"User not found, Please login again",
            });
        }

        //5. compare old password
        const isOldPasswordCorrect = await bcrypt.compare(oldPassword, userDetails.password);   
        if(!isOldPasswordCorrect) {
            return res.status(400).json({
                success:false,
                message:"Old Password is incorrect, please try again",
            });
        }   

        //6. hash and update new password
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        //7. update password in DB
        await User.findByIdAndUpdate(userId, {password: hashedNewPassword}, {new:true});

        //8. send mail to user about password update
        try {
            const email = userDetails.email;
            const title = "Password Changed Successfully";
            const body = `<h1>Your password has been changed successfully</h1>
                          <p>If you did not initiate this change, please contact our support immediately.</p>`;

            await mailSender(email, title, body); // send mail by mailSender function
        }  
        catch (error) {
            console.log("Error in sending password change mail", error);
        }        

        //9. return response successfully
        return res.status(200).json({
            success:true,
            message:"Password changed successfully",
        });

    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Error in changing password, Please try again",
        })
    }
};