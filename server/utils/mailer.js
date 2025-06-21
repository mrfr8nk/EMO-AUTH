const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // Create transporter
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    // Mail options
    const mailOptions = {
        from: `NexusAuth <${process.env.EMAIL_USER}>`,
        to: options.to,
        subject: options.subject,
        html: options.text
    };

    // Send email
    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
