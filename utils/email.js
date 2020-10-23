const nodemailer = require("nodemailer");
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
