import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class FacultyCreateDto {
    @IsString()
    @IsNotEmpty()
    name: string;
};


export class FacultyUpdateDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsNumber()
    @IsNotEmpty()
    id: number;
}

export class FacultyDeleteDto {
    @IsNumber()
    @IsNotEmpty()
    id: number;
}