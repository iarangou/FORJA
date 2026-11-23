// Instrumento institucional facilitado por FORJA (Microsoft Forms, PDF de 7 páginas).
// Pregunta 14: escala 5 = Totalmente de acuerdo, 1 = Totalmente en desacuerdo.
export const LIKERT_OPTIONS=[
 {value:5,label:"Totalmente de acuerdo"},
 {value:4,label:"De acuerdo"},
 {value:3,label:"Neutro"},
 {value:2,label:"En desacuerdo"},
 {value:1,label:"Totalmente en desacuerdo"},
] as const;

export const LIKERT_ITEMS=[
 {id:"q14_1",text:"Se realizó una reunión / jornada / actividad donde se identificaron junto al profesor y/o estudiantes las necesidades sentidas de su comunidad / organización"},
 {id:"q14_2",text:"Considera que como socio o aliado hizo un aporte para que profesores y estudiantes conocieran el contexto social de su comunidad / organización"},
 {id:"q14_3",text:"Los objetivos del proyecto de servicio fueron consensuados entre la comunidad / organización y el profesor y/o estudiantes"},
 {id:"q14_4",text:"Los pasos de ejecución del proyecto de servicio fueron consensuados entre la comunidad / organización y la contraparte del curso (profesor, estudiantes y/o profesional de FORJA)"},
 {id:"q14_5",text:"El / los productos o servicios realizados por los estudiantes fue acordado con la comunidad / organización según su priorización de necesidades"},
 {id:"q14_6",text:"Las condiciones del territorio afectaron la plena ejecución del proyecto"},
 {id:"q14_7",text:"Hubo responsabilidad compartida entre el socio comunitario / aliados institucionales y con el profesor y los estudiantes en el desarrollo del proyecto"},
 {id:"q14_8",text:"Existió una comunicación fluida y buena disposición entre los actores (socio comunitario / aliado institucional, profesor y estudiantes) a favor de la calidad del servicio"},
 {id:"q14_9",text:"La relación establecida entre las personas involucradas en el proyecto se caracterizó por una actitud de respeto y cordialidad"},
 {id:"q14_10",text:"Los estudiantes y el profesor cumplieron con los acuerdos establecidos con la comunidad / organización"},
 {id:"q14_11",text:"Las actividades / productos realizados por los estudiantes de la Universidad Javeriana aportaron significativamente a las necesidades de su comunidad / organización"},
 {id:"q14_12",text:"Se realizó una jornada de cierre de actividades del proyecto de aprendizaje servicio o entrega de productos que permitió el diálogo y retroalimentación sobre el trabajo realizado entre profesor, estudiantes, comunidad / aliado"},
 {id:"q14_13",text:"Considera que como socio comunitario / aliado institucional aportó al proceso formativo de los estudiantes"},
 {id:"q14_14",text:"La comunidad valora positivamente el proyecto realizado por los estudiantes javerianos"},
] as const;

export const ACTION_LINES=[
 {id:"salud_bienestar",label:"Salud y Bienestar",description:"Promoción de la salud, prevención de enfermedad, balance nutricional, juegos para el desarrollo motriz"},
 {id:"desarrollo_humano",label:"Desarrollo Humano, Paz, Equidad y Democracia",description:"Habilidades para la vida, educación, prevención de violencias, justicia restaurativa, consultorio jurídico, finanzas personales, formulación de proyectos"},
 {id:"habitat",label:"Hábitat, Conservación y Restauración Ecológica",description:"Infraestructura, vías, acueductos, bioconstrucción, caracterización de especies, mejoramiento de vivienda, levantamiento de planos"},
 {id:"cultura_creacion",label:"Cultura y Creación",description:"Comunicaciones y cultura, rap por la vida, alimentando sonrisas, matemáticas en la vida"},
 {id:"industria_biotecnologia",label:"Industria, Biotecnología y Bioeconomía",description:"Emprendimientos, consultoría empresarial, soberanía alimentaria, tecnologías productivas, software de rehabilitación"},
] as const;
