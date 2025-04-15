import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { MailerService } from '@nestjs-modules/mailer';
import {
  orderCreationEmail,
  orderPaymentEmail,
  orderUpdatedEmail,
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
      secure: false, // true for 587
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
  async sendProductListedEmail(
    email: string,
    user: User,
    productName: string,
    price: number,
    stock: number,
  ) {
    const html = productListedEmail({
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

    console.log(`Product listing email successfully sent to ${email}`);
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

    console.log(`Product update email sent to ${email}`);
  }
  async sendOrderCreationEmail(
    email: string,
    userName: string,
    orderId: string,
    totalAmount: number,
  ) {
    const html = orderCreationEmail({ userName, orderId, totalAmount });
    await this.mailerService.sendMail({
      to: email,
      from: {
        name: "O'Ben Brands",
        address: process.env.MAIL_FROM,
      },
      subject: html.subject,
      html: html.msg,
    });

    console.log(`Order creation email sent to ${email}`);
  }
  async sendOrderUpdateEmail(
    email: string,
    userName: string,
    orderId: string,
    previousStatus: string,
    newStatus: string,
    totalAmount: number,
  ) {
    const html = orderUpdatedEmail({
      userName,
      orderId,
      previousStatus,
      newStatus,
      totalAmount,
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

    console.log(`Order updated email sent to ${email}`);
  }
  async sendOrderPaymentEmail(
    email: string,
    userName: string,
    orderId: string,
    totalAmount: number,
    paymentReference: string,
  ) {
    const html = orderPaymentEmail({
      userName,
      orderId,
      totalAmount,
      paymentReference,
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

    console.log(`Payment confirmation email sent to ${email}`);
  }
}
