import { IsEmail, IsInt, IsNotEmpty, IsString, Min, MinLength } from 'class-validator';

export class RegisterDto {
    @IsInt()
    @Min(1)
    faculty_id: number;

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
