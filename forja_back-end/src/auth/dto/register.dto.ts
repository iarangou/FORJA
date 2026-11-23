import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
export class RegisterDto {
  @IsEmail({host_whitelist:['javerianacali.edu.co']},{message:'Usa el correo institucional @javerianacali.edu.co'})
  email:string;

  @IsString() @IsNotEmpty() @MaxLength(180)
  full_name:string;

  @IsString() @MinLength(12) @MaxLength(128)
  password:string;
}
