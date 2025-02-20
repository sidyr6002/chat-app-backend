import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class UsernameCheckDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty({ message: 'Username is required and cannot be empty.' })
  @Matches(/^[a-zA-Z][a-zA-Z0-9_]{3,15}$/, {
    message:
      'Username must start with a letter, contain only letters, numbers, and underscores, and be between 4 and 16 characters long.',
  })
  username: string;
}
