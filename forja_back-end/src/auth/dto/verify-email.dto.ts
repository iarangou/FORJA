import { IsEmail, IsString, Matches } from 'class-validator';

export class VerificationEmailDto {
  @IsEmail({ host_whitelist: ['javerianacali.edu.co'] })
  email: string;
}

export class VerifyEmailDto extends VerificationEmailDto {
  @IsString()
  @Matches(/^\d{6}$/, { message: 'El código debe tener 6 dígitos' })
  code: string;
}