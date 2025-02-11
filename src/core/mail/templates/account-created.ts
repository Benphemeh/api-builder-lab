const headerTemplate = `
<div class="header">
    <a href="https://x.com/Rollpay_Africa" style="color: #ffffff; margin: 0 10px;" target="_blank"><img src="https://rollpay-media.s3.af-south-1.amazonaws.com/rollpay_pry_logo.png" alt="Rollpay Logo" /></a>
    <div>
        <a href="https://www.rollpay.app" style="color: #000; margin: 0 10px;">Home</a>
        <a href="https://blog.rollpay.app/" style="color: #000; margin: 0 10px;">Blog</a>
        <a href="https://www.rollpay.app/" style="color: #000; margin: 0 10px;">Tutorials</a>
        <a href="https://www.rollpay.app/contact" style="color: #000; margin: 0 10px;">Support</a>
    </div>
</div>
`;

const footerTemplate = `
<div class="footer">
    <p>&copy; 2024 Rollpay, Muritala Muhammad, Yaba. Lagos</p>
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
            color: #000000;
            padding: 20px;
            text-align: center;
        }
        .footer {
            background-color: #004d40;
            color: #ffffff;
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
export const userOnBoardEmail = (firstName: string) => {
  const msg = `
  <p>Dear ${firstName},</p>
  <p>Welcome to API builder APP, the comprehensive payment platform for the diverse African entertainment industry. We're excited to have you on board!</p>
  <p>Our platform facilitates seamless transactions, provides tailored payment solutions, and incorporates project management features, all aimed at supporting the growth and sustainability of your projects.</p>
  <p>Get started by creating your profile and initiating your first project. If you have any questions or need assistance, our support team is always ready to help.</p>
  <p>Welcome to the future of entertainment payments!</p>
  <p>With Precision and Care,<br> Rollpay Africa</p>
  `;
  const subject = `Welcome to Rollpay Africa`;
  return { msg: emailTemplate(msg), subject };
};

export const sendUserConfirmation = (email: string) => {
  const msg = `
  <p>Hi ${email},</p>
  <p>You are welcome and your account has been created on api-builder App. </p>
  <p>Click on the link below to change the default password to your desired password </p>

  <p>If you did not request this email you can safely ignore it.</p>`;
  const subject = `Welcome to Rollpay Africa`;
  return { msg: emailTemplate(msg), subject };
};
