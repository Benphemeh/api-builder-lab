const headerTemplate = `
<div class="header">
    <a href="https://oben-brands.onrender.com/" style="color: #ffffff; margin: 0 10px;" target="_blank"><img src="https://files.fm/u/ms6dd78z5u" alt="Onimuelede Logo" /></a>
    <div>
        <a href="https://oben-brands.onrender.com/" style="color: #000; margin: 0 10px;">Home</a>
        <a href="https://blog.rollpay.app/" style="color: #000; margin: 0 10px;">Blog</a>
        <a href="https://www.rollpay.app/" style="color: #000; margin: 0 10px;">Tutorials</a>
        <a href="https://oben-brands.onrender.com/" style="color: #000; margin: 0 10px;">Support</a>
    </div>
</div>
`;

const footerTemplate = `
<div class="footer">
    <p>&copy; 2024 O'Ben brands, 18, Ogunleye street, off oshinfolarin. Ilaje, Bariga. Lagos</p>
    <div class="social-icons">
        <a href="https://x.com/Rollpay_Africa" style="color: #ffffff; margin: 0 10px;" target="_blank"><img src="https://rollpay-media.s3.af-south-1.amazonaws.com/icons8-x-50.png" alt="X" /></a>
        <a href="https://www.facebook.com/rollpayafrica/" style="color: #ffffff; margin: 0 10px;" target="_blank"><img src="https://rollpay-media.s3.af-south-1.amazonaws.com/icons8-facebook-50-wht.png" alt="Facebook" /></a>
        <a href="https://www.instagram.com/rollpay_africa/" style="color: #ffffff; margin: 0 10px;" target="_blank"><img src="https://rollpay-media.s3.af-south-1.amazonaws.com/icons8-instagram-50.png" alt="Instagram" /></a>
        <a href="https://www.linkedin.com/company/rollpay-africa/" style="color: #ffffff; margin: 0 10px;" target="_blank"><img src="https://rollpay-media.s3.af-south-1.amazonaws.com/icons8-linkedin-50.png" alt="LinkedIn" /></a>
    </div>
</div>
`;
const emailTemplate = (content: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f9f9f9;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border: 1px solid #ddd;
            border-radius: 8px;
            overflow: hidden;
        }
        .header {
            background-color: #ffffff;
            color:rgb(39, 36, 36);
            padding: 20px;
            text-align: center;
        }
        .footer {
            background-color:rgb(9, 39, 31);
            color:rgb(191, 94, 94);
            padding: 20px;
            text-align: center;
        }
        .header a img {
            width: 150px;
            height: 150px;
            object-fit: contain;
        }
        .content {
            padding: 20px;
            color: #333333;
        }
        .content h1 {
            font-size: 24px;
            margin-bottom: 10px;
        }
        .content p {
            font-size: 16px;
            line-height: 1.5;
        }
        .footer p {
            font-size: 14px;
            margin: 5px 0;
        }
        .footer a {
            color: #ffffff;
            text-decoration: none;
        }
        .social-icons img {
            width: 24px;
            margin: 0 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        ${headerTemplate}
        <div class="content">
            ${content}
        </div>
        ${footerTemplate}
    </div>
</body>
</html>
`;
interface UserOnBoardParams {
  firstName: string;
}
export const userOnBoardEmail = (params: UserOnBoardParams) => {
  const msg = `
  <p>Dear ${params.firstName},</p>

  <p>Welcome to <strong>OnimuElede</strong>, your one-stop platform for premium pig farming, pork products, and farm services. We're thrilled to have you join our community!</p>

  <p>At OnimuElede, you can:</p>
  <ul>
    <li>Browse and purchase pigs based on size and breed.</li>
    <li>Order fresh pork meat by kilogram for delivery.</li>
    <li>Access essential farm services, including treatments, fumigation, and general farm maintenance.</li>
  </ul>

  <p>Get started by exploring our store and placing your first order. If you have any questions, our support team is always here to help.</p>

  <p>Thank you for trusting OnimuElede for your farm needs!</p>

  <p>Best regards,</p>
  <p><strong>O'Ben brands</strong></p>`;
  const subject = `Welcome to OnimuElede – Your Trusted Hub for Quality Pigs & Farm Products!`;
  return { msg: emailTemplate(msg), subject };
};

export const sendUserConfirmation = (firstName: string) => {
  const msg = `
  <p>Hi ${firstName},</p>

  <p>Welcome to <strong>OnimuElede</strong>! Your account has been successfully created.</p>
  <p>To secure your account, please click the link below to set your password:</p>

  <p>If you did not request this email you can safely ignore it.</p>
   <p>Best regards,</p>
  <p><strong>O'Ben brands</strong></p>`;
  const subject = `Confirmation of Your OnimuElede Account`;
  return { msg: emailTemplate(msg), subject };
};
interface ProductListedParams {
  firstName: string;
  productName: string;
  price: number;
  stock: number;
}

export const productListedEmail = (params: ProductListedParams) => {
  const formattedPrice = `₦${Number(params.price).toLocaleString()}`;
  const msg = `
  <p>Dear ${params.firstName},</p>
  <p>Your product <strong>${params.productName}</strong> has been listed successfully.</p>
  <p><strong>Price:</strong> ${formattedPrice}</p>
  <p><strong>Stock:</strong> ${params.stock}</p>
  <p>Thank you for using our service.</p>
  <p>Best regards,</p>
  <p><strong>O'Ben Brands</strong></p>
  `;
  const subject = `Product Listed Successfully`;
  return { msg: emailTemplate(msg), subject };
};
interface ProductUpdatedParams {
  firstName: string;
  productName: string;
  price: number;
  stock: number;
}

export const productUpdatedEmail = (params: ProductUpdatedParams) => {
  const formattedPrice = `₦${Number(params.price).toLocaleString()}`;
  const msg = `
  <p>Dear ${params.firstName},</p>
  <p>Your product <strong>${params.productName}</strong> has been updated successfully.</p>
  <p><strong>New Price:</strong> ${formattedPrice}</p>
  <p><strong>New Stock:</strong> ${params.stock} units</p>
  <p>Thank you for using our service.</p>
  <p>Best regards,</p>
  <p>O'Ben Brands</p>
  `;

  const subject = `Product Updated Successfully`;

  return { msg: emailTemplate(msg), subject };
};
interface OrderCreationParams {
  userName: string;
  orderId: string;
  totalAmount: number;
}

export const orderCreationEmail = (params: OrderCreationParams) => {
  const formattedTotalAmount = `₦${Number(params.totalAmount).toLocaleString()}`;
  const msg = `
  <p>Dear ${params.userName},</p>

  <p>Thank you for your order! Your order has been successfully created.</p>

  <p><strong>Order ID:</strong> ${params.orderId}</p>
  <p><strong>Total Amount:</strong> ${formattedTotalAmount}</p>

  <p>We are processing your order and will notify you once it is ready for shipping.</p>

  <p>Thank you for shopping with us!</p>

  <p>Best regards,</p>
  <p><strong>O'Ben brands</strong></p>`;

  const subject = `Order Confirmation – Order ID: ${params.orderId}`;
  return { msg: emailTemplate(msg), subject };
};
interface OrderUpdateParams {
  userName: string;
  orderId: string;
  previousStatus: string;
  newStatus: string;
  totalAmount: number;
}

export const orderUpdatedEmail = (params: OrderUpdateParams) => {
  const formattedTotalAmount = `₦${Number(params.totalAmount).toLocaleString()}`;
  const msg = `
  <p>Dear ${params.userName},</p>

  <p>Your order has been updated.</p>

  <p><strong>Order ID:</strong> ${params.orderId}</p>
  <p><strong>Previous Status:</strong> ${params.previousStatus}</p>
  <p><strong>New Status:</strong> ${params.newStatus}</p>
  <p><strong>Total Amount:</strong> ${formattedTotalAmount}</p>

  ${
    params.newStatus === 'completed'
      ? '<p>Your order has been completed successfully. Thank you for your purchase!</p>'
      : params.newStatus === 'canceled'
        ? '<p>We regret to inform you that your order has been canceled. If you have any questions, please contact our customer support.</p>'
        : '<p>We are processing your order and will keep you updated on its progress.</p>'
  }

  <p>Thank you for shopping with us!</p>

  <p>Best regards,</p>
  <p><strong>O'Ben brands</strong></p>`;

  const subject = `Order Update – Order ID: ${params.orderId}`;
  return { msg: emailTemplate(msg), subject };
};
interface OrderPaymentParams {
  userName: string;
  orderId: string;
  totalAmount: number;
  paymentReference: string;
}

export const orderPaymentEmail = (params: OrderPaymentParams) => {
  const formattedTotalAmount = `₦${Number(params.totalAmount).toLocaleString()}`;
  const msg = `
  <p>Dear ${params.userName},</p>

  <p>We have successfully received your payment for the following order:</p>

  <p><strong>Order ID:</strong> ${params.orderId}</p>
  <p><strong>Total Amount:</strong> ${formattedTotalAmount}</p>
  <p><strong>Payment Reference:</strong> ${params.paymentReference}</p>

  <p>Thank you for your payment. We are processing your order and will notify you once it is ready for shipping.</p>

  <p>Best regards,</p>
  <p><strong>O'Ben Brands</strong></p>`;

  const subject = `Payment Confirmation – Order ID: ${params.orderId}`;
  return { msg: emailTemplate(msg), subject };
};
interface OrderReadyForDeliveryParams {
  userName: string;
  orderId: string;
  deliveryAddress: string;
  logisticsProvider: string;
}

export const orderReadyForDeliveryEmail = (
  params: OrderReadyForDeliveryParams,
) => {
  const msg = `
  <p>Dear ${params.userName},</p>

  <p>Your order is now ready for delivery!</p>

  <p><strong>Order ID:</strong> ${params.orderId}</p>
  <p><strong>Delivery Address:</strong> ${params.deliveryAddress}</p>
  <p><strong>Logistics Provider:</strong> ${params.logisticsProvider}</p>

  <p>Our logistics team will contact you shortly to arrange the delivery. Thank you for choosing O'Ben Brands!</p>

  <p>Best regards,</p>
  <p><strong>O'Ben Brands</strong></p>`;

  const subject = `Order Ready for Delivery – Order ID: ${params.orderId}`;
  return { msg: emailTemplate(msg), subject };
};
interface OrderDeliveredParams {
  userName: string;
  orderId: string;
  deliveryAddress: string;
  logisticsProvider: string;
}

export const orderDeliveredEmail = (params: OrderDeliveredParams) => {
  const msg = `
  <p>Dear ${params.userName},</p>

  <p>We are pleased to inform you that your order has been successfully delivered!</p>

  <p><strong>Order ID:</strong> ${params.orderId}</p>
  <p><strong>Delivery Address:</strong> ${params.deliveryAddress}</p>
  <p><strong>Logistics Provider:</strong> ${params.logisticsProvider}</p>

  <p>Thank you for shopping with O'Ben Brands. We hope to serve you again soon!</p>

  <p>Best regards,</p>
  <p><strong>O'Ben Brands</strong></p>`;

  const subject = `Order Delivered – Order ID: ${params.orderId}`;
  return { msg: emailTemplate(msg), subject };
};

interface OrderVerificationParams {
  userName: string;
  orderId: string;
  verificationCode: string;
}

export const orderVerificationEmail = (params: OrderVerificationParams) => {
  const msg = `
    <p>Dear ${params.userName},</p>
  
    <p>Your order requires verification before processing.</p>
  
    <p><strong>Order ID:</strong> ${params.orderId}</p>
    <p><strong>Verification Code:</strong> ${params.verificationCode}</p>
  
    <p>Please use the above verification code to confirm your order. Thank you for choosing O'Ben Brands!</p>
  
    <p>Best regards,</p>
    <p><strong>O'Ben Brands</strong></p>`;

  const subject = `Order Verification Required – Order ID: ${params.orderId}`;
  return { msg: emailTemplate(msg), subject };
};

interface ProductRestockedParams {
  firstName: string;
  productName: string;
  newStock: number;
}

export const productRestockedEmail = (params: ProductRestockedParams) => {
  const msg = `
    <p>Dear ${params.firstName},</p>
    <p>Your product <strong>${params.productName}</strong> has been restocked.</p>
    <p><strong>New Stock:</strong> ${params.newStock} units</p>
    <p>Thank you for keeping your inventory up to date.</p>
    <p>Best regards,</p>
    <p><strong>O'Ben Brands</strong></p>
  `;
  const subject = `Product Restocked Successfully`;
  return { msg: emailTemplate(msg), subject };
};
export const emailVerificationEmail = (
  firstName: string,
  verificationUrl: string,
  token?: string, // Optional token for testing
) => {
  const subject = 'Verify Your Email Address';
  const msg = `
    <p>Hi ${firstName},</p>
    <p>Thank you for registering. Please verify your email by clicking the link below:</p>
    <a href="${verificationUrl}" target="_blank">Verify Email</a>
    ${
      token
        ? `<p><strong>Token:</strong> ${token}</p>` // Include token for testing
        : ''
    }
    <p>If you did not request this, please ignore this email.</p>
    <p>Best regards,<br/>O'Ben Brands</p>
  `;
  return { subject, msg };
};
export const passwordResetEmail = (
  firstName: string,
  resetUrl: string,
  token?: string, // Optional token for testing
) => {
  const subject = 'Reset Your Password';
  const msg = `
    <p>Hi ${firstName},</p>
    <p>You requested a password reset. Click the link below to set a new password:</p>
    <a href="${resetUrl}" target="_blank">Reset Password</a>
    ${
      token
        ? `<p><strong>Token:</strong> ${token}</p>` // Include token for testing
        : ''
    }
    <p>If you did not request this, please ignore this email.</p>
    <p>Best regards,<br/>O'Ben Brands</p>
  `;
  return { subject, msg };
};
