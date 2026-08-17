const nodemailer = require("nodemailer");

const sendResetPasswordEmail = async (email, resetLink) => {
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
    subject: "Reset Your Password",
    text: `You requested a password reset. Use the following link to set a new password: ${resetLink}`,
    html: ` 
    <div style="font-family: Arial, sans-serif; max-width: 500px;"> 
    <h1 style="color: #2c3e50;">Reset Your Password</h1> 
    <p>We received a request to reset the password for your account.</p>
    <p>Click the button below to choose a new password:</p> 
    <a href="${resetLink}" style=" display: inline-block; padding: 10px 20px; background: #0ea5e9; 
    color: white; text-decoration: none; font-weight: bold; border-radius: 5px; " > Reset Password </a>
    <p style="margin-top: 15px;"> This link will expire in 15 minutes. </p>
    <p> If you did not request a password reset, you can safely ignore this email. </p>
    <p> Best regards,<br> <strong>Support Team</strong> </p> 
    </div> `,
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

module.exports = sendResetPasswordEmail;
