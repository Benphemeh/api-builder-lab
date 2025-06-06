import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { MailerService } from '@nestjs-modules/mailer';
import {
  emailVerificationEmail,
  emailVerifiedEmail,
  invoiceEmailTemplate,
  orderCreationEmail,
  orderDeliveredEmail,
  orderPaymentEmail,
  orderReadyForDeliveryEmail,
  orderUpdatedEmail,
  orderVerificationEmail,
  passwordResetEmail,
  productListedEmail,
  productRestockedEmail,
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

    console.log(`create order email sent to ${email}`);
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
  async sendOrderReadyForDeliveryEmail(
    email: string,
    userName: string,
    orderId: string,
    deliveryAddress: string,
    logisticsProvider: string,
  ) {
    const html = orderReadyForDeliveryEmail({
      userName,
      orderId,
      deliveryAddress,
      logisticsProvider,
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

    console.log(`Order ready for delivery email sent to ${email}`);
  }
  async sendOrderDeliveredEmail(
    email: string,
    userName: string,
    orderId: string,
    deliveryAddress: string,
    logisticsProvider: string,
  ) {
    const html = orderDeliveredEmail({
      userName,
      orderId,
      deliveryAddress,
      logisticsProvider,
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

    console.log(`Order delivered email sent to ${email}`);
  }
  async sendOrderVerificationEmail(
    email: string,
    userName: string,
    orderId: string,
    verificationCode: string,
  ) {
    const html = orderVerificationEmail({
      userName,
      orderId,
      verificationCode,
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

    console.log(`Order verification email sent to ${email}`);
  }

  async sendProductRestockedEmail(
    email: string,
    user: User,
    productName: string,
    newStock: number,
  ) {
    const html = productRestockedEmail({
      firstName: user.firstName,
      productName,
      newStock,
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

    console.log(`Product restock email sent to ${email}`);
  }
  async sendEmailVerification(
    email: string,
    firstName: string,
    verificationUrl: string,
    token?: string,
  ) {
    const { subject, msg } = emailVerificationEmail(
      firstName,
      verificationUrl,
      token,
    );
    await this.mailerService.sendMail({
      to: email,
      subject,
      html: msg,
      from: {
        name: "O'Ben Brands",
        address: process.env.MAIL_FROM,
      },
    });
  }
  async sendEmailVerified(email: string, firstName: string) {
    const { subject, msg } = emailVerifiedEmail(firstName);
    await this.mailerService.sendMail({
      to: email,
      subject,
      html: msg,
      from: {
        name: "O'Ben Brands",
        address: process.env.MAIL_FROM,
      },
    });
  }
  async sendPasswordReset(
    email: string,
    firstName: string,
    resetUrl: string,
    token?: string,
  ) {
    const { subject, msg } = passwordResetEmail(firstName, resetUrl, token);
    await this.mailerService.sendMail({
      to: email,
      subject,
      html: msg,
      from: {
        name: "O'Ben Brands",
        address: process.env.MAIL_FROM,
      },
    });
  }
  async sendInvoiceEmail(
    email: string,
    userName: string,
    orderId: string,
    totalAmount: number,
    products: { productId: string; quantity: number }[],
  ): Promise<void> {
    const html = invoiceEmailTemplate({
      userName,
      orderId,
      totalAmount,
      products,
    });

    await this.mailerService.sendMail({
      to: email,
      from: {
        name: "O'Ben Brands",
        address: process.env.MAIL_FROM,
      },
      subject: `Invoice for Order ID: ${orderId}`,
      html: html,
    });

    console.log(`Invoice email sent to ${email}`);
  }
}
