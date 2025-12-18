const mongoose = require('mongoose');
const mailSender = require('../utils/mailSender');
const emailTemplate = require("../mail/templates/emailVerificationTemplate");

const OTPSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    otp: {
        type: String,
        required: true,     
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        expires: 5*60, // OTP expires in 5 minutes
    },

});

// here we define a function to send emails for OTP verification
async function sendVerificationEmail(email, otp) {
    try {
        const mailResponse = await mailSender(email, "Verification Email/OTP from StudyNotion", emailTemplate(otp));
        console.log("Mail sent successfully: ", mailResponse.response);
    }
    catch (error) {
        console.log("Error occured while sending mails: ", error);
        throw error;
    }
}

// here we are going to use pre 'save' hook to send verification email before save entry to the database
OTPSchema.pre('save', async function(next) {
    console.log("New document saved to database");
    // Only send an email when a new document is created
	if (this.isNew) {
		await sendVerificationEmail(this.email, this.otp);
	}
	next();
});

module.exports = mongoose.model('OTP', OTPSchema);