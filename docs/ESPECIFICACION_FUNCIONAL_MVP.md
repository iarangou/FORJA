# FORJA — Especificación funcional provisional del MVP

> **Estado: hipótesis de trabajo del equipo de desarrollo, NO reglas institucionales confirmadas.**
> Basada en requisitos y decisiones levantadas en el proyecto, el borrador de análisis ético aportado y las limitaciones del código actual.
> Se adopta para avanzar sin documentos internos a los que el equipo no tiene acceso. Cualquier cambio futuro se maneja como ajuste de requisitos y migración, sin borrar datos.

## Principios del sistema

1. Una **cuenta** tiene un rol: ADMINISTRADOR, PROFESOR o MONITOR. El administrador crea las cuentas de los profesores y de los monitores. **No hay registro público de profesores**. Se usará una contraseña provisional generada aleatoriamente, con cambio obligatorio al primer acceso: **no usar la cédula como contraseña real** aunque figurara como sugerencia antigua.
2. Un **proyecto** conserva código único e identidad a través de varios semestres. Cada **período académico** (año y semestre) tiene su registro, responsable, asignaturas, información y decisión de aprobación independientes.
3. El profesor registra proyectos y períodos actuales; el administrador revisa y aprueba o devuelve períodos. El monitor registra proyectos/períodos históricos con datos parciales, anotando qué falta; **no aprueba el semestre actual**.
4. Para proyectos históricos en ejecución, los períodos pasados se conservan como **históricos** y el período actual lo registra el profesor como **actual** y lo somete a revisión.
5. El administrador es quien marca el proyecto **finalizado**. El estado general del proyecto no sustituye el estado de aprobación de cada período.
6. Evidencias y resultados pertenecen a un período. El administrador revisa las evidencias; si se reemplaza un archivo aprobado, debe quedar nuevamente **pendiente de revisión**.
7. La **carta final firmada** se redacta y firma **fuera** del sistema; solo se almacena y consulta la versión final firmada. No hay editor de cartas ni versiones de borradores.
8. El formulario comunitario se diligencia **una sola vez por proyecto** como hipótesis consistente con la reunión; si FORJA necesita uno por período, debe revisarse expresamente. No usar el código público del proyecto como mecanismo de autenticación: enlace con token aleatorio, de uso limitado.
9. Los territorios (7), ODS y población se guardan como catálogos o relaciones; deben permitir exportar Excel por territorio. **Los nombres exactos de los siete territorios no están confirmados:** no inventarlos ni asignarlos en producción.
10. Datos sensibles de participantes y beneficiarios: evitar listas nominativas innecesarias. El análisis ético registra **categorías agregadas**, no la pertenencia o condición de personas identificables.

## Formulario A. Registro general del proyecto

### A1. Identidad y continuidad
- **Título**: texto, obligatorio para guardar.
- **Código FORJA**: autogenerado e inmutable; no lo escribe el profesor.
- **Tipo**: nuevo o histórico, asignado según el flujo del usuario.
- **¿Continúa un proyecto previo?**: sí/no. Si sí, referencia por código o ID existente (opcional para históricos incompletos).
- **Problemática** y **justificación**: texto libre. Problemática requerida **al enviar a revisión**, no en borrador.
- **Objetivo general**, **objetivos específicos** y **actividades**: textos. Obligatorios al enviar a revisión del período.
- **ODS**: selección múltiple entre 17 objetivos, con opción de no asignar mientras sea borrador.

### A2. Participantes y contexto institucional
- **Facultad/instituto**, **departamento**, **programa/carrera**, **asignatura(s)**: catálogos; varias asignaturas/carreras por período.
- **Docente(s)**: relación con usuarios profesores; uno responsable por período.
- **Número de estudiantes por período**: entero no negativo, obligatorio antes de enviar.
- **Nombres individuales de estudiantes**: **no recopilar en MVP** salvo exigencia posterior y autorización.
- **Organización/comunidad**: nombre, formal/informal, ubicación, contacto, correo/teléfono opcionales.
- **Territorio(s)**: catálogo de siete, nombres sujetos a confirmación.
- **Población beneficiaria**: tipo, descripción y **cantidad estimada**; varios tipos posibles.

### A3. Planeación por semestre
- **Año académico y semestre**: 1 o 2; único por proyecto.
- **Duración esperada del proyecto**: 1 o 2 semestres (tomado del formato ético); si el proyecto se reactiva, los períodos continúan por separado.
- **Fechas de inicio y fin**: fechas; fin >= inicio.
- **Presupuesto**: valor en COP no negativo y breve explicación; requerido para envío.
- **Resultados y conclusiones**: se diligencian durante o al terminar la ejecución.
- **Evidencias**: exclusivamente documentos PDF (hasta 20 MB por archivo en el MVP). Las fotos se incorporan dentro del PDF y los videos se referencian mediante enlaces a YouTube escritos dentro del PDF. Los enlaces no se descargan ni verifican automáticamente. La verificación antivirus debe añadirse antes del despliegue institucional.
- **Documentación faltante**: nota explícita cuando el registro es histórico e incompleto.

### A4. Reglas de guardado
- **BORRADOR**: permite datos incompletos, excepto título e identidad del autor.
- **EN_REVISION**: backend exige campos obligatorios del proyecto, del período y análisis ético; **no exige avales automáticos por población seleccionada**.
- **DEVUELTO**: el profesor puede corregir el período y reenviar; mantener observaciones/historial.
- **APROBADO**: bloquear cambios de planeación; evidencias y resultados pueden avanzar bajo reglas de revisión.
- El administrador puede aprobar/devolver cada **período**; se registra quién, cuándo y observaciones.

## Formulario B. Consideraciones éticas

El Word disponible trae datos generales y preguntas numeradas **18 y 19**, sin preguntas 1–17. Por tanto se plantea un formulario ético MVP propio, **no se presenta como reproducción completa ni oficial del formato**.

- Los datos generales se **autorrellenan** desde proyecto y período; no volver a pedir nombre, asignatura o profesor.
- **Fecha de solicitud** automática; posibilidad de indicar un proyecto antecedente.
- **Tipo de población externa predominante**: selector de *una* categoría (literal «más predominante» del Word). Lista del documento íntegra: menores; mayores de 65; institucionalizados; discapacidad; LGBTIQ+; víctimas del conflicto; excombatientes; personas enfermas; minorías étnicas; habitantes de calle; migrantes; embarazo; vulnerabilidad socioeconómica; otro; ninguno.
- **Grupo universitario predominante**: una categoría: estudiantes de la institución, de otras instituciones, trabajadores/colaboradores, personas privadas de libertad, fuerzas armadas/policía, otro, ninguno.
- **¿Habrá contacto directo con personas o tratamiento de información personal?** sí/no, y medidas de privacidad.
- **¿Participarán menores o población vulnerable?** sí/no. La respuesta se guarda como información para que el administrador evalúe el proyecto, **sin exigir aval automáticamente**.
- **¿Habrá fotografías, videos o testimonios identificables?** sí/no. Se registra esta condición para evaluación del administrador; no se bloquea automáticamente el envío por documentos.
- **Medidas de confidencialidad, no discriminación y mitigación de riesgos**: campo descriptivo.
- **Observaciones del profesor** y **declaración de veracidad**: casilla antes de enviar.
- **Estado**: BORRADOR / EN_REVISION / APROBADO / DEVUELTO (distinto del estado del período). En el MVP se puede dejar la evaluación como datos de borrador mientras se implementa el proceso formal.
- Se registra un análisis ético inicial **por proyecto** y se revisa nuevamente cuando cambien sustancialmente población/actividades. Se señala como regla asumida pendiente de aprobación institucional.

## Formulario C. Evaluación de la comunidad

Una respuesta por proyecto mediante un enlace privado con token de alta entropía. **No requiere crear usuario**. Captura: nombre de organización, relación con el proyecto, cumplimiento de objetivos (escala propuesta 1–5), utilidad para la comunidad (1–5), participación (1–5), comentarios y autorización para guardar la evaluación. Solo se captura nombre de la persona si resulta estrictamente necesario. **Preguntas y escala son propuestas**, no tomadas del Word.

## Flujo administrativo y documentos

Ver `docs/CHECKLIST_DOCUMENTAL_ASUMIDO.md`: el formulario y su análisis ético se presentan al administrador, que aprueba o devuelve el período con observaciones. **No hay requisito automático de aval documental.** La carta firmada no se exige para registrar ni enviar un proyecto.

## Qué no se debe asumir sin validación

- Que el formato ético de dos páginas es oficial o exhaustivo.
- Que FORJA obliga a recopilar documentos individuales de estudiantes o beneficiarios.
- Que hay aval automático de proyectos en semestres posteriores.
- Que los siete nombres de territorio, las preguntas finales de encuesta, el contenido exacto de las cartas o los plazos de retención ya están aprobados.

## Alcance actual del código

La rama de desarrollo ya incorpora núcleo de proyectos y períodos en SQL, pero **NO significa que este documento entero esté implementado**. Las pantallas, roles y flujos deben evolucionar de forma incremental y probarse con PostgreSQL y Docker antes de fusionar.
