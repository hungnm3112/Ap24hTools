import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('MAIL_HOST') || 'smtp.gmail.com',
      port: 587,
      secure: false, // true cho port 465, false cho các port khác
      auth: {
        user: this.configService.get<string>('MAIL_USER'),
        pass: this.configService.get<string>('MAIL_PASS'),
      },
    });
  }

  async sendOtpEmail(to: string, otp: string) {
    const mailOptions = {
      from: `"Ap24h Tools" <${this.configService.get<string>('MAIL_USER')}>`,
      to,
      subject: 'Mã xác thực OTP của bạn',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h3>Chào bạn,</h3>
          <p>Đây là mã xác thực (OTP) của bạn để hoàn tất quá trình. Mã này có hiệu lực trong 5 phút:</p>
          <h1 style="color: #1890ff; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
          <p>Vui lòng không chia sẻ mã này cho bất kỳ ai.</p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('Đã gửi email OTP tới:', to);
    } catch (error) {
      console.error('Lỗi gửi email:', error);
    }
  }
}
