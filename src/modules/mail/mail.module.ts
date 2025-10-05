import {MailService} from './services/mail.service';
import {Global, Module} from '@nestjs/common';
import {MailerModule} from '@nestjs-modules/mailer';
import {HandlebarsAdapter} from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import 'dotenv/config';

@Global()
@Module({
  exports: [MailService],
  imports: [
    MailerModule.forRootAsync({
      useFactory: async () => ({
        defaults: {
          from: `"No Reply" <${process.env.MAIL_FROM}>`,
        },
        template: {
          adapter: new HandlebarsAdapter(),
          dir: './src/modules/mail/templates',
          options: {
            strict: true,
          },
        },
        transport: {
          auth: {
            pass: process.env.MAIL_PASSWORD,
            user: process.env.MAIL_USER,
          },
          host: process.env.MAIL_HOST,
          port: 587,
          secure: false,
        },
      }),
    }),
  ],
  providers: [MailService],
})
export class MailModule {}
