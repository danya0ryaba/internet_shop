import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";

class MailService {
  transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo>;
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    } as SMTPTransport.Options);
  }

  async sendActivationMail(to: string, link: string) {
    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_USER, // от кого исходит письмо
        to, // email пользователя, которому отправляется письмо
        subject: "Активация аккаунта на " + process.env.API_URL,
        text: "подтвердите аккаунт",
        html: `
          <div>
          <h1>Для активации перейдите по ссылке</h1>
          <a href="${link}">${link}</a>
          </div>
        `,
      });
    } catch (err) {
      console.log("Словил маслину в MailService.sendActivationMail");
    }
  }
}

export const mailService = new MailService();
