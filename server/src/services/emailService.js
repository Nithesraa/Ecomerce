import nodemailer from 'nodemailer';
import logger from '../utils/logger.js';
import dotenv from 'dotenv';
dotenv.config();

// Create a transporter using ethereal email for testing or real SMTP
const createTransporter = async () => {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_PORT == 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    logger.warn('No SMTP credentials found in .env. Falling back to Ethereal Email for testing.');
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }
};

export const sendOrderConfirmationEmail = async (userEmail, orderData) => {
  try {
    const transporter = await createTransporter();
    
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"ShopSphere" <noreply@shopsphere.com>',
      to: userEmail,
      subject: `Order Confirmation - #${orderData._id}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #050505; color: #ffffff; padding: 40px; border-radius: 12px;">
          <h1 style="margin-top: 0; font-size: 24px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px;">ShopSphere</h1>
          <hr style="border-color: rgba(255,255,255,0.1); margin: 20px 0;" />
          <h2 style="font-size: 20px;">Thank you for your order!</h2>
          <p style="color: #94a3b8; line-height: 1.6;">Your order <strong>#${orderData._id}</strong> has been successfully placed and is currently being processed.</p>
          <div style="background-color: #111; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #94a3b8;">Total Amount:</p>
            <p style="margin: 5px 0 0; font-size: 24px; font-weight: bold;">$${orderData.totalAmount?.toFixed(2)}</p>
          </div>
          <p style="color: #94a3b8; font-size: 14px;">You can view your receipt and track your order status in your ShopSphere account.</p>
        </div>
      `,
    });

    logger.info(`Order confirmation email sent to ${userEmail}. Message ID: ${info.messageId}`);
    if (info.messageId && !process.env.SMTP_HOST) {
      logger.info(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }
  } catch (error) {
    logger.error(`Failed to send order confirmation email: ${error.message}`);
  }
};

export const sendOrderShippedEmail = async (userEmail, orderData) => {
  try {
    const transporter = await createTransporter();
    
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"ShopSphere" <noreply@shopsphere.com>',
      to: userEmail,
      subject: `Your Order has Shipped! - #${orderData._id}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #050505; color: #ffffff; padding: 40px; border-radius: 12px;">
          <h1 style="margin-top: 0; font-size: 24px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px;">ShopSphere</h1>
          <hr style="border-color: rgba(255,255,255,0.1); margin: 20px 0;" />
          <h2 style="font-size: 20px;">Great news! Your order is on its way.</h2>
          <p style="color: #94a3b8; line-height: 1.6;">Your order <strong>#${orderData._id}</strong> has been marked as shipped. It should arrive at your shipping address soon.</p>
          <p style="color: #94a3b8; font-size: 14px; margin-top: 30px;">Thank you for shopping with us!</p>
        </div>
      `,
    });

    logger.info(`Order shipped email sent to ${userEmail}. Message ID: ${info.messageId}`);
    if (info.messageId && !process.env.SMTP_HOST) {
      logger.info(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }
  } catch (error) {
    logger.error(`Failed to send order shipped email: ${error.message}`);
  }
};

export const sendWelcomeEmail = async (userEmail, userName, role) => {
  try {
    const transporter = await createTransporter();
    
    const roleText = role === 'SELLER' ? 'Seller Account' : 'Customer Account';
    const bodyText = role === 'SELLER' 
      ? `Welcome to ShopSphere! Your Seller Account has been successfully created. You can now start adding products to your store and reaching millions of customers.`
      : `Welcome to ShopSphere! Your Customer Account has been successfully created. You can now start browsing our premium catalog and placing orders.`;

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"ShopSphere" <noreply@shopsphere.com>',
      to: userEmail,
      subject: `Welcome to ShopSphere! (${roleText} Created)`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #050505; color: #ffffff; padding: 40px; border-radius: 12px;">
          <h1 style="margin-top: 0; font-size: 24px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px;">ShopSphere</h1>
          <hr style="border-color: rgba(255,255,255,0.1); margin: 20px 0;" />
          <h2 style="font-size: 20px;">Hi ${userName},</h2>
          <p style="color: #94a3b8; line-height: 1.6;">${bodyText}</p>
          <p style="color: #94a3b8; font-size: 14px; margin-top: 30px;">Thank you for joining the ShopSphere community!</p>
        </div>
      `,
    });

    logger.info(`Welcome email sent to ${userEmail}. Message ID: ${info.messageId}`);
    if (info.messageId && !process.env.SMTP_HOST) {
      logger.info(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }
  } catch (error) {
    logger.error(`Failed to send welcome email: ${error.message}`);
  }
};

export const sendAbandonedCartEmail = async (userEmail, userName, cartData) => {
  try {
    const transporter = await createTransporter();
    
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"ShopSphere" <noreply@shopsphere.com>',
      to: userEmail,
      subject: `You left something behind! 🛒`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #050505; color: #ffffff; padding: 40px; border-radius: 12px;">
          <h1 style="margin-top: 0; font-size: 24px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px;">ShopSphere</h1>
          <hr style="border-color: rgba(255,255,255,0.1); margin: 20px 0;" />
          <h2 style="font-size: 20px;">Hi ${userName},</h2>
          <p style="color: #94a3b8; line-height: 1.6;">We noticed you left some amazing items in your cart. They are waiting for you!</p>
          <div style="background-color: #111; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #94a3b8;">Items in Cart:</p>
            <p style="margin: 5px 0 0; font-size: 24px; font-weight: bold;">${cartData.items.length} item(s)</p>
          </div>
          <p style="color: #94a3b8; font-size: 14px;">Return to ShopSphere to complete your order before these items sell out.</p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/cart" style="display: inline-block; margin-top: 20px; background-color: #ffffff; color: #000000; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 4px; text-transform: uppercase; letter-spacing: 1px;">Return to Cart</a>
        </div>
      `,
    });

    logger.info(`Abandoned cart email sent to ${userEmail}. Message ID: ${info.messageId}`);
    if (info.messageId && !process.env.SMTP_HOST) {
      logger.info(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }
  } catch (error) {
    logger.error(`Failed to send abandoned cart email: ${error.message}`);
  }
};
