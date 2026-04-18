import {timingSafeEqual} from 'crypto';

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {RedisService} from '../../../common/redis/redis.service';
import {E_OTP_PURPOSE} from '../constants';

import 'dotenv/config';

type TOtpVerificationResult<TMetadata = unknown> = {
  valid: boolean;
  metadata?: TMetadata;
};

const OTP_TTL_SECONDS = 300;

const isTest = process.env.NODE_ENV === 'test';

type TOtpPayload = {
  code: string;
  metadata?: unknown;
};

@Injectable()
export class OtpService {
  constructor(private readonly redisService: RedisService) {}

  private otpKey(userId: string, purpose: E_OTP_PURPOSE): string {
    return `otp:${userId}:${purpose}`;
  }

  async generateOtp<TMetadata = unknown>(
    userId: string,
    purpose: E_OTP_PURPOSE,
    metadata?: TMetadata
  ): Promise<string> {
    const otp = isTest
      ? '123456'
      : Math.floor(100000 + Math.random() * 900000).toString();

    const key = this.otpKey(userId, purpose);
    const payload: TOtpPayload = {code: otp};
    if (metadata !== undefined) {
      payload.metadata = metadata;
    }

    await this.redisService.redis.set(
      key,
      JSON.stringify(payload),
      'EX',
      OTP_TTL_SECONDS
    );

    return otp;
  }

  async verifyOtp<TMetadata = unknown>(
    userId: string,
    otp: string,
    purpose: E_OTP_PURPOSE
  ): Promise<TOtpVerificationResult<TMetadata>> {
    const key = this.otpKey(userId, purpose);
    const raw = await this.redisService.redis.get(key);

    if (!raw) {
      throw new NotFoundException('OTP not found');
    }

    let parsed: TOtpPayload;

    try {
      parsed = JSON.parse(raw) as TOtpPayload;
    } catch {
      throw new BadRequestException('OTP payload is invalid');
    }

    if (typeof parsed.code !== 'string') {
      throw new BadRequestException('OTP payload is invalid');
    }

    const encoder = new TextEncoder();
    const expected = encoder.encode(parsed.code);
    const actual = encoder.encode(otp);

    if (
      expected.length !== actual.length ||
      !timingSafeEqual(expected, actual)
    ) {
      throw new NotFoundException('OTP not found');
    }

    await this.redisService.redis.del(key);

    return {
      valid: true,
      metadata: parsed.metadata as TMetadata,
    };
  }
}
