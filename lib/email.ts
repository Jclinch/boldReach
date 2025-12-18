// lib/email.ts
// Email sending utility using nodemailer and custom SMTP

import nodemailer from 'nodemailer';

const smtpConfig = {
  host: process.env.SMTP_HOST || 'mail.boldreachlogistics.com.ng',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || 'noreply@boldreachlogistics.com.ng',
    pass: process.env.SMTP_PASS || '',
  },
  tls: {
    rejectUnauthorized: false, // Allow self-signed certificates (debug only)
  },
};

let transporter: nodemailer.Transporter | null = null;

export const getEmailTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport(smtpConfig);
    
    // Log connection events for debugging
    transporter.on('error', (err: Error) => {
      console.error('❌ SMTP Transport Error:', err);
    });
    
    transporter.verify((error: Error | null) => {
      if (error) {
        console.error('❌ SMTP Verification Failed:', error);
      } else {
        console.log('✅ SMTP Verification Success');
      }
    });
  }
  return transporter;
};

export const sendPasswordResetEmail = async (email: string, resetLink: string) => {
  const transporter = getEmailTransporter();

  console.log('📧 Attempting to send password reset email...');
  console.log('  To:', email);
  console.log('  SMTP Host:', process.env.SMTP_HOST);
  console.log('  SMTP Port:', process.env.SMTP_PORT);
  console.log('  SMTP Secure:', process.env.SMTP_SECURE);
  console.log('  SMTP User:', process.env.SMTP_USER);

  const htmlContent = `
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Reset Your Password • BoldReach Logistics</title>
  <style>
    :root {
      --brand: #F97316;
      --dark: #1E293B;
      --muted: #475569;
      --bg: #ffffff;
      --border: #E5E7EB;
    }
    body { margin:0; padding:0; background: var(--bg); font-family: Inter, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; color: var(--dark); }
    .container { max-width: 560px; margin: 0 auto; padding: 24px; }
    .card { background: #fff; border: 1px solid var(--border); border-radius: 16px; box-shadow: 0 1px 2px rgba(16,24,40,0.06); overflow: hidden; }
    .header { padding: 24px; text-align: center; border-bottom: 1px solid var(--border); }
    .logo { font-size: 22px; font-weight: 800; color: var(--brand); letter-spacing: 0.2px; }
    .content { padding: 24px 24px 8px; }
    h1 { font-size: 22px; margin: 0 0 8px; }
    p { font-size: 14px; line-height: 1.5; color: var(--muted); }
    .cta { display: inline-block; margin-top: 16px; background: var(--brand); color: #fff !important; text-decoration: none; padding: 12px 16px; border-radius: 10px; font-weight: 600; }
    .footer { padding: 16px 24px 24px; font-size: 12px; color: var(--muted); border-top: 1px solid var(--border); }
    .muted { color: var(--muted); }
    .link { color: var(--brand); text-decoration: underline; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <div class="logo">BoldReach Logistics</div>
      </div>
      <div class="content">
        <h1>Reset your password</h1>
        <p>We received a request to reset the password for your BoldReach account. Click the button below to choose a new password. This link will expire in 24 hours.</p>
        <p style="margin-top:12px;">
          <a href="${resetLink}" class="cta">Choose a new password</a>
        </p>
        <p class="muted" style="margin-top:16px;">If you didn't request this, you can safely ignore this email.</p>
      </div>
      <div class="footer">
        <p>Need help? Contact our support team at <a class="link" href="mailto:support@boldreach.com">support@boldreach.com</a>.</p>
        <p>© <span id="year"></span> BoldReach Logistics. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;

  try {
    const info = await transporter.sendMail({
      from: `${process.env.SMTP_FROM_NAME || 'BoldReach Logistics'} <${process.env.SMTP_USER || 'noreply@boldreachlogistics.com.ng'}>`,
      to: email,
      subject: 'Reset Your Password • BoldReach Logistics',
      html: htmlContent,
    });
    console.log('✅ Email sent successfully:', info.messageId);
    return { success: true };
  } catch (error) {
    console.error('❌ Failed to send reset email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to send email' };
  }
};
