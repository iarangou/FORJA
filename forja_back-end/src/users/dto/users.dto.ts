import { IsBoolean, IsEmail, IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min, MinLength } from "class-validator";
import { Transform } from "class-transformer";
import { ValidateIf } from "class-validator";

export class UserProfileUpdateDto {
    @ValidateIf((_object, value) => value !== undefined)
    @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
    @IsString()
    @IsNotEmpty()
    @MaxLength(180)
    full_name?: string;

    @ValidateIf((_object, value) => value !== undefined)
    @IsInt()
    @Min(1)
    faculty_id?: number;
}

export class UserCreateDto {
    @ValidateIf((object, value) => object.rol_id === 3 || value !== undefined)
    @IsInt()
    @Min(1)
    faculty_id?: number;

    @IsEmail(
        { host_whitelist: ['javerianacali.edu.co'] },
        { message: 'Email must be a valid javerianacali.edu.co email address' },
    )
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(180)
    full_name: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    password: string;

    @IsInt()
    @Min(1)
    @Max(3)
    rol_id: number;

    @IsBoolean()
    is_active: boolean;
}

export class UserUpdateDto {
    @ValidateIf((_object, value) => value !== undefined)
    @IsInt()
    @Min(1)
    faculty_id?: number;

    @IsInt()
    @Min(1)
    id: number;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(180)
    full_name?: string;

    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(3)
    rol_id?: number;

    @IsOptional()
    @IsBoolean()
    is_active?: boolean;
}

export class UserDeleteDto {
    @IsInt()
    @Min(1)
    id: number;
}

export class ReviewRegistrationDto {
    @IsIn(['APPROVE','REJECT'])
    decision:'APPROVE'|'REJECT';

    @IsOptional() @IsIn([2,3])
    rol_id?:number;

    @IsOptional() @IsInt() @Min(1)
    faculty_id?:number;
}
