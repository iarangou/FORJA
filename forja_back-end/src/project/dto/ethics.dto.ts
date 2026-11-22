import {
  IsBoolean, IsIn, IsNotEmpty, IsOptional, IsString, MaxLength,
} from 'class-validator';

// Codigos equivalentes a las casillas del borrador de analisis etico.
// Se agregan preguntas cautelares como SUPUESTO de desarrollo; no son formato oficial.
export const EXTERNAL_POPULATION = [
  'MENORES','ADULTOS_MAYORES','ADULTOS_MAYORES_INSTITUCIONALIZADOS',
  'DISCAPACIDAD','LGBTIQ','VICTIMAS_CONFLICTO','EXCOMBATIENTES',
  'PERSONAS_ENFERMEDAD','MINORIAS_ETNICAS','HABITANTES_CALLE',
  'MIGRANTES','EMBARAZO','VULNERABILIDAD_SOCIOECONOMICA','OTRO','NINGUNO',
] as const;

export const UNIVERSITY_POPULATION = [
  'ESTUDIANTES_INSTITUCION','ESTUDIANTES_OTRAS_INSTITUCIONES',
  'TRABAJADORES_ORGANIZACION','PERSONAS_PRIVADAS_LIBERTAD',
  'FUERZAS_ARMADAS_POLICIA','OTRO','NINGUNO',
] as const;

export class SaveEthicsDto {
  @IsOptional() @IsIn(EXTERNAL_POPULATION)
  external_population?: typeof EXTERNAL_POPULATION[number];

  @IsOptional() @IsIn(UNIVERSITY_POPULATION)
  university_population?: typeof UNIVERSITY_POPULATION[number];

  @IsOptional() @IsString() @MaxLength(500)
  external_population_other?: string;

  @IsOptional() @IsString() @MaxLength(500)
  university_population_other?: string;

  @IsOptional() @IsBoolean()
  handles_personal_data?: boolean;

  @IsOptional() @IsBoolean()
  involves_vulnerable_population?: boolean;

  @IsOptional() @IsBoolean()
  identifiable_media?: boolean;

  @IsOptional() @IsString() @MaxLength(5000)
  privacy_measures?: string;

  @IsOptional() @IsString() @MaxLength(5000)
  risk_mitigation?: string;

  @IsOptional() @IsBoolean()
  permission_document_confirmed?: boolean;

  @IsOptional() @IsBoolean()
  truthful_declaration?: boolean;

  @IsOptional() @IsString() @MaxLength(5000)
  notes?: string;
}
