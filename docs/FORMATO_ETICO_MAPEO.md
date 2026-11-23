# FORJA — Levantamiento del formato de análisis ético

**Fuente:** `Formato de Análisis Ético para Proyectos de Servicio EQUIPO A.docx`, 2 páginas, entregado para el proyecto FORJA.  
**Estado:** levantamiento inicial; el documento contiene una nota editorial pendiente y únicamente las preguntas numeradas 18 y 19. No asumir que es la versión final ni el formulario completo de creación de proyectos.

## 1. Datos generales que solicita el documento

| Campo del formato | Ubicación recomendada en FORJA |
| --- | --- |
| Título del proyecto | Proyecto: `project.title` |
| Asignatura(s) vinculada(s) | Relación proyecto/período con asignaturas; una o varias |
| Docente(s) responsable(s) | Responsables por proyecto y/o período; más de uno posible |
| Estudiante(s) participante(s) | Participantes por período; confirmar si se registran nombres o solo cantidad |
| Facultad / Instituto | Datos académicos relacionados con el período |
| Departamento y Programa | Estructura académica |
| Organización, comunidad o socio comunitario | Catálogo de comunidades/organizaciones y su relación con el proyecto |
| Persona de contacto de organización/comunidad | Contacto y datos de autorización |
| Duración | Un semestre o dos semestres |
| Fecha de inicio y fin | Fechas de proyecto/período, definir alcance |
| Fecha de solicitud del análisis ético | Fecha del registro de análisis |
| ¿Continúa proyecto anterior? | Referencia opcional al proyecto antecedente por ID/código |

## 2. Pregunta 18: población externa predominante

Opciones del formato:

- Menores de edad
- Adultos mayores (65 años o más)
- Adultos mayores institucionalizados
- Personas en situación de discapacidad física o mental
- Comunidad LGBTIQ+
- Víctimas de conflicto armado
- Excombatientes - reinsertados
- Pacientes / personas en condición de enfermedad
- Minorías étnicas (indígena, afrocolombiana, rom, raizal y palenquera)
- Habitantes de calle
- Población migrante
- Personas en estado de embarazo
- Población en condición de vulnerabilidad socioeconómica
- Otro (especificar)
- Ninguno

El documento señala que cuando el proyecto involucre población vulnerable deben adjuntarse permisos institucionales o aval de la organización socia.

## 3. Pregunta 19: grupo universitario

- Estudiantes de la misma institución
- Estudiantes de otras instituciones educativas
- Trabajadores o colaboradores de la organización socia
- Personas privadas de la libertad
- Fuerzas armadas o Policía
- Otro (especificar)
- Ninguno

## 4. Diseño propuesto (pendiente de validación)

- No hacer una copia rígida del Word: usar secciones reutilizables con campos condicionales y opción de adjuntar el documento original si se requiere.
- Los datos generales se ingresan una sola vez y se reutilizan en el análisis ético y períodos, evitando duplicidad.
- Asociar el análisis a proyecto o período según la periodicidad que confirme FORJA.
- Guardar la categoría de población a nivel agregado; NO recopilar condiciones sensibles identificables de beneficiarios sin necesidad, base jurídica, autorización y controles de acceso.
- Guardar avales y permisos con controles de acceso; nunca publicarlos en la página abierta.
- El formato habla de tipo **más predominante** pero presenta casillas: confirmar si la respuesta es única o múltiple.
- Confirmar si se necesita registrar nombres individuales de estudiantes o solamente la cantidad por período.
- Confirmar si estas preguntas son toda la evaluación ética o si faltan preguntas 1 a 17.
- Confirmar si el formulario ético es obligatorio para todos los proyectos y quién lo revisa.

## 5. Relación con los requerimientos generales

Este documento NO incluye varios campos definidos en requisitos FORJA: problemática, objetivos, actividades, presupuesto, ODS, territorios, evidencias, observaciones de aprobación, resultados y conclusiones. Deben desarrollarse en otros módulos/formularios.

El flujo funcional previsto del sistema es: borrador → solicitud de revisión → aprobación/devolución por período → ejecución/evidencias → resultados y cierre, con soporte para digitalización de históricos incompletos por monitores. Las reglas exactas de cuándo se exige el análisis ético aún deben validarse con FORJA.


## 6. Estado implementado en FORJA (noviembre de 2026)

**Este apartado describe la implementación posterior; no modifica ni completa las preguntas que realmente aparecían en el documento de origen.**

El Word aportado contenía las preguntas numeradas 18 y 19 sobre poblaciones. El sistema implementó un formulario digital de consideraciones éticas **basado parcialmente** en esos campos, junto con preguntas adicionales de protección de información, medios identificables, medidas de privacidad y veracidad. No debe presentarse como transcripción íntegra o como formato oficial aprobado.

| Campo de la plataforma | Dónde se guarda | Alcance |
| --- | --- | --- |
| Población externa predominante (una categoría) | `project_ethics.external_population` | Se elige en «Consideraciones éticas»; **también es filtro de proyectos y exportación Excel**. |
| Población universitaria predominante | `project_ethics.university_population` | Una categoría. |
| Tratamiento de datos, vulnerabilidad, medios identificables y medidas de privacidad | `project_ethics` | Información para revisión administrativa, sin exigencia automática de avales por categoría. |
| ODS | `project.ods_ids` | Lista múltiple de los **17 Objetivos de Desarrollo Sostenible**. Se muestran en «Consideraciones éticas», pero pertenecen al proyecto. |
| Zona territorial institucional | `project_territories` y `forja_territories` | Desplegable múltiple de **siete zonas aún pendientes de denominación oficial** en «Información general». |
| Facultad, departamento académico, carrera | `project_periods` y catálogos académicos | Datos **por semestre**. El sistema admite por ahora una carrera principal por período. |

**Distinciones importantes:**

- La zona territorial FORJA **no** es el departamento académico de los estudiantes.
- La selección de población externa se refiere a una **categoría predominante** y no equivale a contar beneficiarios únicos.
- Los campos éticos se guardan principalmente **por proyecto** y pueden bloquearse cuando un semestre actual está aprobado o en revisión; no existe todavía un historial independiente de análisis éticos por semestre.
- Los monitores pueden registrar el análisis ético de un proyecto histórico con datos parciales, sin inventar información.
- Las validaciones de ética y los avisos de privacidad deben revisarse institucionalmente antes de tratar datos reales.

Para el comportamiento de los formularios: [Especificación funcional](ESPECIFICACION_FUNCIONAL_MVP.md). Para las pruebas de roles: [Manual de pruebas](COMO_PROBAR_MVP.md).
