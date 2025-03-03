import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { MailerService } from '@nestjs-modules/mailer';
import { userOnBoardEmail } from './templates/account-created';
import { User } from '../database';

@Injectable()
export class MailService {
  async sendUserConfirmation({
    email,
    subject,
    content,
  }: {
    email: string;
    subject: string;
    content: string;
  }) {
    const { MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASSWORD } = process.env;
    const transporter = nodemailer.createTransport({
      host: MAIL_HOST,
      port: Number(MAIL_PORT),
      secure: false, // true for 587, false for other ports
      auth: {
        user: MAIL_USER,
        pass: MAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
    await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: email,
      subject,
      html: content,
    });
  }
  constructor(private mailerService: MailerService) {}

  async sendUserOnBoard(email: string, user: User) {
    const msg = userOnBoardEmail(user);
    await this.mailerService.sendMail({
      to: email,
      from: {
        name: 'Rollpay',
        address: process.env.MAIL_FROM,
      },
      subject: msg.subject,
      html: msg.msg,
    });
  }
}
