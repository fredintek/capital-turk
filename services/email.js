const nodemailer = require("nodemailer");

// new Email(user, url).sendResetPassword()

class Email {
  constructor(user, url) {
    this.to = user.email;
    this.url = url;
    this.from = "Capital Turk";
  }

  loadTransporter() {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async send(subject) {
    // define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      text: this.url,
    };

    // load transporter and send email
    await this.loadTransporter().sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
      } else {
        console.log("Email sent:", info.response);
      }
    });
  }

  async sendResetPassword() {
    await this.send("Reset Your Password");
  }
}

module.exports = Email;
