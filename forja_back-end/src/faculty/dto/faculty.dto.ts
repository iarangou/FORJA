import { IsNotEmpty, IsInt, IsNumber, IsString, Min, MaxLength } from "class-validator";

export class FacultyCreateDto {
    @IsInt()
    @Min(1)
    id: number;

    @IsString()
    @IsNotEmpty()
    @MaxLength(180)
    name: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(10)
    code: string;
};


export class FacultyUpdateDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsInt()
    @Min(1)
    id: number;
}

export class FacultyDeleteDto {
    @IsInt()
    @Min(1)
    id: number;
}