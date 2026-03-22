import {Injectable} from '@nestjs/common';
import {MailerService} from '@nestjs-modules/mailer';

import 'dotenv/config';
import {User} from '@prisma/client';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendOtp(user: User, otp: string, subject: string) {
    await this.mailerService.sendMail({
      context: {
        otp,
      },
      from: process.env.MAIL_FROM,
      subject,
      template: './confirmation',
      to: user.email,
    });
  }
}
