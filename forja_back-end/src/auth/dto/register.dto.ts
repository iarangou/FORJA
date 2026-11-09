import { IsEmail, isEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
    @IsString()
    @IsEmail({host_whitelist: ['javerianacali.edu.co']}, {message: 'Email must be a valid javerianacali.edu.co email address'})
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    full_name: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    password: string;
}
