const nodemailer = require("nodemailer");
const AppError = require("./api/AppError");
exports.sendEmail = async (options) => {
  // create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  // define the email option
  const mailOptions = {
    from: `Natours <kaunghtetkyaw.khk@mtu.edu.mm>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };
  // Actually send the email
  await transporter.sendMail(mailOptions);
};

exports.sendEmailAndHandleErrors = async (req, res, next, userDoc) => {
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/resetPassword/${resetToken}`;
  const message = `Forget Password? Please send a PATCH request to ${resetURL} along with your email address and new password`;
  // handling potential error from sendEmail(nodemailer)
  try {
    await sendEmail({
      email: userDoc.email,
      subject: "Your password reset token (valid for 10 mins)",
      message,
    });
    res.status(200).json({
      status: "success",
      message: "Reset URL have already been sent to your email address",
    });
  } catch (error) {
    // rest the token and expires date
    userDoc.passwordResetToken = undefined;
    userDoc.passwordResetExpiresAt = undefined;
    await userDoc.save({ validateBeforeSave: false });
    return next(
      new AppError("There was an error sending email. Please try again", 500)
    );
  }
};
