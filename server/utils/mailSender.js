const nodemailer = require('nodemailer');

const mailSender = async (email, title, body) => {
    try {
        // here we are creating a transporter
        let transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            },
        })
        // now we are sending the mail by using sendMail() method
        let info = await transporter.sendMail({
            from: 'StudyNotion || KAtiyarr - by VIsh',
            to: `${email}`,
            subject: `${title}`,
            html : `${body}`,
        })
        console.log(info);
        return info; 

    }
    catch(error){
        console.log(error.message);
    }
}

module.exports = mailSender;
