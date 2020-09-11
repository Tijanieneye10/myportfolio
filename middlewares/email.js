const nodemailer = require('nodemailer')
// email function
async function sendMail(email, fullname, password) {
    let transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER, // generated ethereal user
            pass: process.env.EMAIL_PASSWORD, // generated ethereal password
        },
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: '"Usman Tijani" brainyworld@gmail.com', // sender address
        to: email, // list of receivers
        subject: "Account Password", // Subject line
        html: `<b>Dear ${fullname} your new password is ${password}</b>`, // html body
    });

    console.log("Message sent: %s", info.messageId);

    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}

module.exports = sendMail