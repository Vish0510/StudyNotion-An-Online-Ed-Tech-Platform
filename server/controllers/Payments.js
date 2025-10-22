// instance of razorpay
const {instance} = require('../config/razorpay');
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const {courseEnrollmentEmail} = require("../mail/templates/courseEnrollmentEmail");
const mongoose = require('mongoose');
const crypto = require("crypto");




// Capture the Payment and initiate the Razorpay order(this handler only the stage of payment creation)
exports.capturePay.payment = async (req, res) => {    
    // get courseId and userId
    const {course_id} = req.body;
    const userId = req.user.id;

    // Validation
    // valid courseId
    if(!course_id) {
        return res.json({
            success:false,
                message:'Please provide valid course ID',
        })
    };

    // valid courseDetails
    let course;
    try {
        course = await Course.findById(course_id);
            if(!course) {
                return res.json({
                    success:false,
                    message:'Could not find the course',
            });
        }

        // user already pay for the same course
        const uid = new mongoose.Types.ObjectId(userId);        // here we are converting userId type from String to objectId.
            
        // here we are checking objectId of user already exist or not in course purchase
        if(course.studentsEnrolled.includes(uid)) {
            return res.status(200).json({
                success:false,
                 message:'Student is Already Enrolled in this Course',
                });
            }
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                    success:false,
                    message:error.message,
                });
            }

        // order create- for that we need options
        const amount = course.price;
        const currency = "INR";

        const options = {
            amount: amount * 100,
            currency,
            receipt: Math.random(Date.now()).toString(),
            notes: {
                courseId: course_id,  // these both need(courseId, userId) after verification of secrets
                userId,
            }
        };
        // here we are calling create function and create order
        try {
            // initiate the payment using razorpay
            const paymentResponse = await instance.orders.create(options);  // here we created order
            console.log(paymentResponse);

            // return response
            return res.status(200).json({
                success:true,
                courseName: course.courseName,
                courseDescription: course.courseDescription,
                thumbnail: course.thumbnail,
                orderId: paymentResponse.id,
                currency: paymentResponse.currency,
                amount:paymentResponse.amount,
            });

        } catch(error) {
            console.log(error);
            return res.status(500).json({
                    success:false,
                    message:"Could not initiate Order",
            });
        }
};




// Verify Signature of Razorpay and Server (Checking payment Authorization)
exports.verifySignature = async (req, res) => {
    // server secret/signature 
    const webhookSecret = "12345678"

    // 2nd secret/signature came from razorpay for matching with server secret
    const signature = req.headers["x-razorpay-signature"];

    // here we follow 3 step
    // 1. here we are creating Hmac object
    const shasum = crypto.createHmac("sha256", webhookSecret);
    // 2. converting Hmac object into String formate
    shasum.update(JSON.stringify(req.body));
    // 3. output in form of hexadeciamal
    const digest = shasum.digest("hex");    // here we convert our webhookSecret into digest.

    // now we will match our digest with signature for authentication
    if(signature === digest) {
        console.log("Payment is Authorished");

        // after authorization we will fetch userId and courseId from notes
        const {courseId, userId} = req.body.payload.payment.entity.notes;

        try {
            // fulfill the action --->>>>
            // find the course and enroll the student in it
            const enrolledCourse = await Course.findOneAndUpdate(
                {_id:courseId},
                {$push:{studentsEnrolled: userId}},
                {new:true},
            );
            // validate response
            if(!enrolledCourse) {
                return res.status(500).json({
                    success:false,
                    message:"Course not Found",
                });
            }

            console.log(enrolledCourse);

            // now find the Student and add the Course to their enrolled course list
            const enrolledStudent = await User.findOneAndUpdate(
                {_id:userId},
                {$push:{courses:courseId}},
                {new:true},
            );
            console.log(enrolledStudent);

            // now sending the mail for confirmation by using mailSender
            const emailResponse = await mailSender(
                enrolledStudent.email,
                "Congratulations from StudyNotion",
                "Congratulations, you are onboarded into new StudyNotion Course",
            );
            console.log(emailResponse);

            // return response
            return res.status(200).json({
                success:true,
                message:"Signature Verified and Course Added",
            });
        }

        catch (error) {
            console.log(error);
            return res.status(500).json({
                success:false,
                message:error.message,
            });
        }
    }
    else {
        return res.status(400).json({
            success:false,
            message:"Invalid Request",
        });
    }
};
