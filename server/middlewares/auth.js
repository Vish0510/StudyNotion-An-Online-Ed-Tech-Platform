const jwt = require('jsonwebtoken');
require('dotenv').config();
const user = require('../models/User');


// auth -> in this we check authentication of user
exports.auth = async (req, res, next) => {
    try {
        // fetch token 
        const authHeader = req.header("Authorization");

        const token =
                    req.cookies?.token ||
                    req.body?.token ||
                    (authHeader && authHeader.replace("Bearer ", ""));

        // if token not present
        if(!token) {
            return res.status(401).json({
                success:false,
                message:"Token not present, authorization denied",
            });
        } 

        // verify token
        try {
            const decode = jwt.verify(token, process.env.JWT_SECRET);
            console.log(decode);
            // attach user to req object
            req.user = decode;
        }
        catch(err) {
            // verification failed
            return res.status(401).json({
                success:false,
                message:"Token is not valid, authorization denied",
            });
        }

        next();

    }
    catch (error) {
        console.log(error);
        return res.status(401).json({
            success:false,
            message:"Something went wrong, while verifying token",
        });
    }
}



// isStudent
exports.isStudent = async (req, res, next) => {
    try {
        if(req.user.accountType !== "Student") {
            return res.status(401).json({
                success:false,
                message: "This is a protected route for Students only",
            });
        } 
        next();
    }
    catch (error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Something went wrong in isStudent middleware",
        });
    }
}


// isInstructor
exports.isInstructor = async (req, res, next) => {
    try {
        if(req.user.accountType !== "Instructor") {
            return res.status(401).json({
                success:false,
                message: "This is a protected route for Instructors only",
            });
        }           
        next();
    }
    catch(error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Something went wrong in isInstructor middleware",
        });
    }
}


// isAdmin
exports.isAdmin = async (req, res, next) => {
    try {
        if(req.user.accountType !== "Admin") {
            return res.status(401).json({
                success:false,
                message: "This is a protected route for Admins only",
            });
        }
        next();
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Something went wrong in isAdmin middleware",
        });
    }
}