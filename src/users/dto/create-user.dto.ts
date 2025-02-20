import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'Username is required and cannot be empty.' })
  @IsString()
  @Matches(/^[a-zA-Z][a-zA-Z0-9_]{3,15}$/, {
    message:
      'Username must start with a letter, contain only letters, numbers, and underscores, and be between 4 and 16 characters long.',
  })
  username: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Email is required and cannot be empty.' })
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Password cannot be empty.' })
  @IsString()
  @MinLength(6, {
    message: 'Password must be at least 6 characters long.',
  })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
    {
      message:
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
    },
  )
  password: string;
}
