const nodemailer = require("nodemailer");

const sendOTPEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your Verification Code",
    text: `Your verification code is ${otp}. This code will expire in 5 minutes.`,
    html: ` <div style="font-family: Arial, sans-serif; max-width: 500px;"> 
    <h1 style="color: #2c3e50;">Verify Your Account</h1> 
    <p>Thank you for creating an account.</p> <p>Use the verification code below to complete your registration:</p>
    <p style=" font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #0ea5e9; "> ${otp} </p> 
    <p>This code will expire in 5 minutes.</p> 
    <p>If you did not request this code, you can safely ignore this email.</p>
    <p> Best regards,<br> <strong>Support Team</strong> </p> </div> `,
    attachments: [
      {
        filename: "logo.png",
        path: "./public/images/nodemailor/mailBanner.jpeg",
        cid: "logo",
      },
    ],
  };

  return transporter.sendMail(mailOptions);
};

module.exports = sendOTPEmail;
