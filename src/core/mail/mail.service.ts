import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { MailerService } from '@nestjs-modules/mailer';
import {
  productListedEmail,
  productUpdatedEmail,
  userOnBoardEmail,
} from './templates';
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
      // from: process.env.MAIL_FROM,
      to: email,
      from: {
        name: "O'Ben brands",
        address: process.env.MAIL_FROM,
      },
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
        name: "O'Ben brands",
        address: process.env.MAIL_FROM,
      },
      subject: msg.subject,
      html: msg.msg,
    });
  }
  async sendProductListedEmail(email: string, user: User, productName: string) {
    const html = productListedEmail({
      firstName: user.firstName,
      productName,
    });
    await this.mailerService.sendMail({
      to: email,
      from: {
        name: "O'Ben brands",
        address: process.env.MAIL_FROM,
      },
      subject: html.subject,
      html: html.msg,
    });
  }
  async sendProductUpdatedEmail(
    email: string,
    user: User,
    productName: string,
    price: number,
    stock: number,
  ) {
    const html = productUpdatedEmail({
      firstName: user.firstName,
      productName,
      price,
      stock,
    });

    await this.mailerService.sendMail({
      to: email,
      from: {
        name: "O'Ben Brands",
        address: process.env.MAIL_FROM,
      },
      subject: html.subject,
      html: html.msg,
    });

    console.log(`Product update email sent successfully to ${email}`);
  }
}
