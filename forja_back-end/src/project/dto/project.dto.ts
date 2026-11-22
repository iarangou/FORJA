import { IsDateString, IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class CreateProjectDTO {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  general_problem?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  general_objective?: string;

  @IsOptional()
  @IsIn(['NUEVO', 'HISTORICO'])
  registration_type?: 'NUEVO' | 'HISTORICO';

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(2)
  duration?: number;

  @IsOptional()
  @IsDateString()
  start_date?: string;

  @IsOptional()
  @IsDateString()
  end_date?: string;
}
