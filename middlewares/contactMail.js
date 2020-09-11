const nodemailer = require('nodemailer')
// email function
async function sendMail(email, name, subject, desc) {
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
        from: `"${name}" ${email}`, // sender address
        to: 'brainyworld10@gmail.com', // list of receivers
        subject: `${subject}`, // Subject line
        html: `${desc}`, // html body
    });

    console.log("Message sent: %s", info.messageId);

    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}

module.exports = sendMail