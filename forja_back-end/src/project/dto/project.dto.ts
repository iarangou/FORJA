import {
  ArrayMaxSize, IsArray, IsDateString, IsIn, IsInt, IsNotEmpty, IsOptional,
  IsString, Max, MaxLength, Min,
} from 'class-validator';

export class CreateProjectDTO {
  @IsString() @IsNotEmpty() @MaxLength(255)
  title: string;

  @IsOptional() @IsString() @MaxLength(5000)
  general_problem?: string;

  @IsOptional() @IsString() @MaxLength(5000)
  general_objective?: string;

  @IsOptional() @IsString() @MaxLength(5000)
  justification?: string;

  @IsOptional() @IsString() @MaxLength(200)
  community_name?: string;

  @IsOptional() @IsString() @MaxLength(180)
  community_contact?: string;

  @IsOptional() @IsString() @MaxLength(2000)
  community_location?: string;

  @IsOptional() @IsInt() @Min(1)
  prior_project_id?: number;

  @IsOptional() @IsArray() @ArrayMaxSize(17)
  @IsInt({each:true}) @Min(1,{each:true}) @Max(17,{each:true})
  ods_ids?: number[];

  @IsOptional() @IsIn(['NUEVO', 'HISTORICO'])
  registration_type?: 'NUEVO' | 'HISTORICO';

  @IsOptional() @IsInt() @Min(1) @Max(2)
  duration?: number;

  @IsOptional() @IsDateString()
  start_date?: string;

  @IsOptional() @IsDateString()
  end_date?: string;
}
