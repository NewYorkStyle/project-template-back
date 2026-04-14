import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {PrismaService} from '../../../common/prisma/prisma.service';
import {type TUserToursListDto} from '../schemas';

@Injectable()
export class UserToursService {
  constructor(private readonly prisma: PrismaService) {}

  async findTourByKey(key: string) {
    const tour = await this.prisma.tour.findUnique({
      where: {key},
      select: {
        id: true,
        isActive: true,
      },
    });

    if (!tour) {
      throw new NotFoundException(`Tour with key "${key}" not found`);
    }

    return tour;
  }

  async markAsSeen(userId: string, key: string): Promise<void> {
    const tour = await this.findTourByKey(key);

    if (!tour.isActive) {
      throw new BadRequestException(
        `Tour with key "${key}" is not active and cannot be marked as seen`
      );
    }

    // upsert для избежания дубликатов по unique constraint [userId, tourId]
    await this.prisma.userTour.upsert({
      where: {
        userId_tourId: {
          userId,
          tourId: tour.id,
        },
      },
      create: {
        userId,
        tourId: tour.id,
      },
      update: {
        // При повторной отметке обновляем seenAt
        seenAt: new Date(),
      },
    });
  }

  async getUserTours(userId: string): Promise<TUserToursListDto> {
    const userTours = await this.prisma.userTour.findMany({
      where: {
        userId,
        tour: {
          isActive: true,
        },
      },
      select: {
        seenAt: true,
        tour: {
          select: {
            key: true,
          },
        },
      },
      orderBy: {
        seenAt: 'desc',
      },
    });

    return {
      tours: userTours.map((userTour) => ({
        key: userTour.tour.key,
        seenAt: userTour.seenAt.toISOString(),
      })),
    };
  }
}
