const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");



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


// SignUp



// Login


// change password