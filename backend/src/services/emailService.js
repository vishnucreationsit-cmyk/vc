const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    // Configure your email service here
    host: 'smtp.gmail.com', // Example
    port: 587,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  const mailOptions = {
    from: `"Vishnu Creations" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    html: options.html
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
