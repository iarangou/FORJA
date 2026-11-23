import {
  IsDateString, IsIn, IsInt, IsNotEmpty, IsNumber, IsOptional,
  IsString, Max, MaxLength, Min,
} from 'class-validator';

export class CreatePeriodDto {
  @IsInt() @Min(1900) @Max(2200)
  academic_year: number;

  @IsInt() @Min(1) @Max(2)
  academic_semester: number;

  @IsOptional() @IsIn(['ACTUAL', 'HISTORICO'])
  record_type?: 'ACTUAL' | 'HISTORICO';

  @IsOptional() @IsInt() @Min(1)
  course_id?: number;

  @IsOptional() @IsInt() @Min(1)
  faculty_id?: number;

  @IsOptional() @IsInt() @Min(1)
  department_id?: number;

  @IsOptional() @IsInt() @Min(1)
  academic_program_id?: number;

  @IsOptional() @IsString() @MaxLength(180)
  historical_teacher_name?: string;

  @IsOptional() @IsString() @MaxLength(5000)
  objectives?: string;

  @IsOptional() @IsString() @MaxLength(5000)
  activities?: string;

  @IsOptional() @IsNumber() @Min(0)
  budget?: number;

  @IsOptional() @IsInt() @Min(0)
  student_count?: number;

  @IsOptional() @IsDateString()
  start_date?: string;

  @IsOptional() @IsDateString()
  end_date?: string;

  @IsOptional() @IsString() @MaxLength(2000)
  community_population_description?: string;

  @IsOptional() @IsString() @MaxLength(2000)
  territory_name?: string;

  @IsOptional() @IsString() @MaxLength(5000)
  missing_information?: string;

  @IsOptional() @IsString() @MaxLength(10000)
  results?: string;

  @IsOptional() @IsString() @MaxLength(10000)
  conclusions?: string;
}

export class ReviewPeriodDto {
  @IsIn(['APROBADO','DEVUELTO'])
  decision: 'APROBADO' | 'DEVUELTO';

  @IsOptional() @IsString() @MaxLength(5000)
  notes?: string;
}

/** Solo datos del período. Año y semestre no se cambian una vez registrado. */
export class UpdatePeriodDto {
  @IsOptional() @IsInt() @Min(1)
  course_id?: number;

  @IsOptional() @IsInt() @Min(1)
  faculty_id?: number;

  @IsOptional() @IsInt() @Min(1)
  department_id?: number;

  @IsOptional() @IsInt() @Min(1)
  academic_program_id?: number;

  @IsOptional() @IsString() @MaxLength(180)
  historical_teacher_name?: string;

  @IsOptional() @IsString() @MaxLength(5000)
  objectives?: string;

  @IsOptional() @IsString() @MaxLength(5000)
  activities?: string;

  @IsOptional() @IsNumber() @Min(0)
  budget?: number;

  @IsOptional() @IsInt() @Min(0)
  student_count?: number;

  @IsOptional() @IsDateString()
  start_date?: string;

  @IsOptional() @IsDateString()
  end_date?: string;

  @IsOptional() @IsString() @MaxLength(2000)
  community_population_description?: string;

  @IsOptional() @IsString() @MaxLength(2000)
  territory_name?: string;

  @IsOptional() @IsString() @MaxLength(5000)
  missing_information?: string;

  @IsOptional() @IsString() @MaxLength(10000)
  results?: string;

  @IsOptional() @IsString() @MaxLength(10000)
  conclusions?: string;
}

/** Informe de ejecución, editable únicamente por el profesor responsable. */
export class SavePeriodResultsDto {
  @IsString() @IsNotEmpty() @MaxLength(10000)
  results: string;

  @IsString() @IsNotEmpty() @MaxLength(10000)
  conclusions: string;
}
