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
}
export const productListedEmail = (params: ProductListedParams) => {
  const msg = `
<p>Dear ${params.firstName},</p>
  <p>Your product <strong>${params.productName}</strong> has been listed successfully.</p>
  <p>Thank you for using our service.</p>
  <p>Best regards,</p>
  <p>O'Ben Brands</p>
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
  const msg = `
  <p>Dear ${params.userName},</p>

  <p>Thank you for your order! Your order has been successfully created.</p>

  <p><strong>Order ID:</strong> ${params.orderId}</p>
  <p><strong>Total Amount:</strong> $${params.totalAmount.toFixed(2)}</p>

  <p>We are processing your order and will notify you once it is ready for shipping.</p>

  <p>Thank you for shopping with us!</p>

  <p>Best regards,</p>
  <p><strong>The Team</strong></p>`;

  const subject = `Order Confirmation – Order ID: ${params.orderId}`;
  return { msg: emailTemplate(msg), subject };
};
