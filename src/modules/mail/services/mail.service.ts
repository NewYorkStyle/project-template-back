import {User} from '../../users/entities/users.entity';
import {Injectable} from '@nestjs/common';
import {MailerService} from '@nestjs-modules/mailer';
import 'dotenv/config';

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
