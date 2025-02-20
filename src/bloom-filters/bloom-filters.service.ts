import { Injectable, OnModuleInit } from '@nestjs/common';
import { ScalableBloomFilter } from 'bloom-filters';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class BloomFiltersService implements OnModuleInit {
  private scalableBloomFilter: ScalableBloomFilter;

  constructor(private readonly prismaService: PrismaService) {}

  /**
   * This function is called when the module is initialized.
   * It populates the bloom filter with all the usernames from the users table.
   * The bloom filter is used to quickly check if a username is available or not.
   */
  async onModuleInit() {
    const users = await this.prismaService.user.findMany({
      select: {
        username: true,
      },
    });

    const usernames = users.map((user) => user.username);

    this.scalableBloomFilter = new ScalableBloomFilter(10000, 0.01);

    usernames.forEach((username) => this.scalableBloomFilter.add(username));
  }

  /**
   * Check if a username is available.
   *
   * The function uses a Scalable Bloom Filter to quickly check if a username is available.
   * The function returns true if the username is available, false otherwise.
   */
  checkUsernameAvailability(username: string) {
    return !this.scalableBloomFilter.has(username);
  }

  /**
   * Adds a username to the Scalable Bloom Filter.
   *
   * This method updates the Bloom Filter with a new username, which will be used
   * for checking availability in future operations.
   */
  addUsername(username: string) {
    this.scalableBloomFilter.add(username);
  }
}
