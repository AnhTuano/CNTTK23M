import { Resend } from 'resend';
import * as nodemailer from 'nodemailer';

// Option 1: Resend (FREE - 3,000 emails/month)
const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// Option 2: Nodemailer with Gmail (FREE - 500 emails/day)
const gmailTransporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export const sendEmail = async (options: EmailOptions) => {
  const from = process.env.EMAIL_FROM || 'ClassZone <noreply@classzone.com>';

  // Try Resend first (if configured)
  if (resend && process.env.RESEND_API_KEY) {
    try {
      const emailData: any = {
        from,
        to: options.to,
        subject: options.subject
      };
      
      // Resend requires either 'html' or 'text', not both
      if (options.html) {
        emailData.html = options.html;
      } else if (options.text) {
        emailData.text = options.text;
      }

      const { data, error } = await resend.emails.send(emailData);

      if (error) {
        console.error('Resend error:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Resend failed, falling back to Gmail:', error);
    }
  }

  // Fallback to Gmail SMTP (always works!)
  return gmailTransporter.sendMail({
    from,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html
  });
};

// Email templates
export const emailTemplates = {
  welcome: (name: string) => ({
    subject: 'Chào mừng đến với ClassZone! 🎓',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #3B82F6;">Xin chào ${name}!</h1>
        <p>Chào mừng bạn đến với <strong>ClassZone</strong> - Nền tảng quản lý lớp học trực tuyến.</p>
        <p>Bắt đầu khám phá các tính năng:</p>
        <ul>
          <li>📰 Tin tức & Thông báo</li>
          <li>📚 Tài liệu học tập</li>
          <li>💬 Chat real-time</li>
          <li>📅 Lịch & Sự kiện</li>
          <li>🏆 Bảng xếp hạng</li>
        </ul>
        <p style="margin-top: 20px;">
          <a href="${process.env.CLIENT_URL}" 
             style="background: #3B82F6; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 6px; display: inline-block;">
            Bắt đầu ngay →
          </a>
        </p>
        <p style="color: #666; font-size: 14px; margin-top: 30px;">
          Trân trọng,<br>
          <strong>ClassZone Team</strong>
        </p>
      </div>
    `,
    text: `Xin chào ${name}!\n\nChào mừng bạn đến với ClassZone!`
  }),

  resetPassword: (name: string, resetUrl: string) => ({
    subject: 'Đặt lại mật khẩu ClassZone 🔐',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #EF4444;">Đặt lại mật khẩu</h1>
        <p>Xin chào ${name},</p>
        <p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản ClassZone.</p>
        <p>Nhấn vào nút bên dưới để đặt lại mật khẩu (link có hiệu lực trong <strong>1 giờ</strong>):</p>
        <p style="margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background: #EF4444; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 6px; display: inline-block;">
            Đặt lại mật khẩu
          </a>
        </p>
        <p style="color: #666; font-size: 14px;">
          Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.
        </p>
        <p style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
          Link: ${resetUrl}
        </p>
      </div>
    `,
    text: `Đặt lại mật khẩu: ${resetUrl}`
  }),

  notification: (name: string, message: string, link?: string) => ({
    subject: '🔔 Thông báo mới từ ClassZone',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3B82F6;">Thông báo mới</h2>
        <p>Xin chào ${name},</p>
        <p>${message}</p>
        ${link ? `
          <p style="margin: 20px 0;">
            <a href="${link}" 
               style="background: #3B82F6; color: white; padding: 10px 20px; 
                      text-decoration: none; border-radius: 6px; display: inline-block;">
              Xem chi tiết →
            </a>
          </p>
        ` : ''}
      </div>
    `,
    text: `Thông báo: ${message}`
  })
};
