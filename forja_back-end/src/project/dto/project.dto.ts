import { IsDate, IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min } from "class-validator";

export class CreateProjectDTO {
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    title: string;

    @IsInt()
    @Min(1)
    // @IsOptional()
    faculty_id?: number;

    @IsInt()
    @Min(1)
    @Max(2)
    // @IsOptional()
    duration?: number;

    @IsDate()
    // @IsOptional()
    start_date?: Date;

    @IsDate()
    // @IsOptional()
    end_date?: Date;
}