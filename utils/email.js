const nodemailer = require("nodemailer");
const pug = require("pug");
const html_to_text = require("html-to-text");
module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.from = `Natours <${process.env.EMAIL_FROM}>`;
    this.url = url;
    this.firstName = user.name.split(" ");
  }
  createNewTransport() {
    if (process.env.NODE_ENV === "production") {
      // return nodemailer.createTransport({
      //   service: "SendGrid",
      //   auth: {
      //     user: process.env.SENDGRID_USERNAME,
      //     pass: process.env.SENDGRID_PASSWORD,
      //   },
      // });
      return 1;
    }
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }
  async send(template, subject) {
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      url: this.url,
      subject,
    });
    // define the email option
    const mailOptions = {
      from: `Natours <kaunghtetkyaw.khk@mtu.edu.mm>`,
      to: this.to,
      subject,
      text: html_to_text.fromString(),
      html,
    };
    // Actually send the email
    await this.createNewTransport().sendMail(mailOptions);
  }
  async sendWelcome() {
    await this.send("welcome", "Welcome to the Natours Family");
  }
  async sendPasswordReset() {
    await this.send(
      "passwordReset",
      "Reset Your Natours account password (valid for 10 mins)"
    );
  }
};
