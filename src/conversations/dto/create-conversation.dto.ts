import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';
import { AtLeastOneField } from 'src/utils/custom-validators/atleast-one-field';

export class CreateConversationDto {
  @ApiProperty({
    description:
      'The email of the participant (optional if username is provided).',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  participantEmail?: string;

  @ApiProperty({
    description:
      'The username of the participant (optional if email is provided).',
    required: false,
  })
  @IsOptional()
  @IsNotEmpty()
  participantUsername?: string;

  @AtLeastOneField(['participantEmail', 'participantUsername'], {
    message:
      'At least one of participantEmail or participantUsername must be provided.',
  })
  _validation_dummy?: any; // dummy field for validation
}
