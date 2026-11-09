import { IsNotEmpty, IsString } from "class-validator";

export class CourseCreateDto {
    @IsNotEmpty()
    @IsString()
    name: string;
};