# FORJA — Checklist documental por semestre

**Finalidad:** hoja de apoyo para probar el flujo de documentos y seguimiento. **No es una política institucional formal**; distingue condiciones que valida el código de requisitos todavía sujetos a aprobación de FORJA.

## Registro y revisión del semestre

| Elemento | En dónde se registra | Responsable | Regla técnica actual |
| --- | --- | --- | --- |
| Proyecto, código y comunidad | Información general | Profesor; monitor si histórico | Código asignado automáticamente; datos básicos obligatorios para envío actual. |
| Año y semestre, asignatura, facultad/departamento/carrera | Períodos académicos | Profesor; monitor histórico | Un período académico único por proyecto; una carrera principal por semestre. |
| Objetivos, actividades, fechas, presupuesto, número de estudiantes | Período académico | Profesor; monitor histórico | Para períodos actuales, campos exigidos al enviar a revisión; histórico admite faltantes. |
| Zonas territoriales y ODS | Información general / Consideraciones éticas | Profesor; monitor histórico | Zonas del catálogo administrable; 17 ODS sin catálogo adicional. |
| Población externa predominante, población universitaria, veracidad | Consideraciones éticas | Profesor; monitor histórico | Formulario digital; las categorías orientan revisión, sin aval automático por categoría. |
| Envío y decisión de aprobación | Período académico | Profesor envía; administrador revisa | Estados separados por semestre: BORRADOR, EN_REVISION, DEVUELTO, APROBADO; observaciones en devolución. |

## Ejecución y cierre del período

| Elemento | Momento | Responsable | Condición del sistema |
| --- | --- | --- | --- |
| Evidencias de ejecución | Período actual aprobado y sin cerrar | Profesor | PDF máximo 20 MB; administrador aprueba o devuelve cada evidencia. |
| Evidencias históricas disponibles | Digitalización de un período anterior | Monitor / Admin | Se archivan sin revisión retrospectiva. Puede haber documentos faltantes. |
| Resultados y conclusiones | Durante o al finalizar período actual | Profesor | Obligatorios para que el administrador pueda cerrar. |
| Cierre de período actual | Al completar los requisitos | Administrador | Período aprobado, resultados y conclusiones, al menos **un PDF aprobado**, ninguno pendiente de revisión. |
| Carta final **firmada** | Después del cierre de cada período actual; históricos cuando exista | Administrador / Monitor | Un PDF final **por semestre**; se redacta y firma **fuera** de FORJA. No bloquea la creación ni el envío inicial del semestre. |
| Evaluación de la comunidad | Al finalizar cada semestre; períodos históricos con documentación disponible | Comunidad mediante enlace del admin | **Una evaluación por semestre**, no una por proyecto. Token privado de un uso; formulario institucional de 19 preguntas. |
| Finalización definitiva del proyecto | Cuando termine de ejecutarse | Administrador | Acción independiente del cierre de cada semestre; verifica que no haya semestres actuales pendientes. |

## Revisión sugerida del administrador

- [ ] Código FORJA correcto y proyecto no duplicado.
- [ ] Semestre seleccionado y profesor responsable correctos.
- [ ] Si es histórico, no se exige aprobación retroactiva y se anotaron los datos/documentos faltantes.
- [ ] Si es actual, se revisaron objetivos, actividades, presupuesto, estudiantes y consideraciones éticas.
- [ ] En caso de devolución, se registraron observaciones.
- [ ] Para cierre, hay resultados, conclusiones y evidencias aprobadas.
- [ ] La carta PDF está asociada al **semestre correcto**, no al proyecto entero.
- [ ] La evaluación comunitaria está asociada al mismo semestre (flujo separado del PDF).
- [ ] Se respetan los permisos de lectura y descarga de información personal o archivos.
- [ ] Antes de un reporte, se comprueban zonas, ODS y población externa predominante.

## Aspectos no implementados como obligación automática

- **Avales especiales por población vulnerable**: el sistema no los exige automáticamente al seleccionar una población. Su pertinencia debe establecerse con FORJA y con la normativa aplicable.
- **Antivirus del PDF**: se valida extensión, MIME, firma inicial y límite de tamaño; falta análisis de contenido malicioso.
- **Versionado de evidencias**: un PDF ya revisado no puede reabrirse; ante corrección se carga un PDF nuevo. No existe versionado completo.
- **Aprobación de evaluaciones comunitarias**: el enlace evita dobles respuestas, pero no constituye verificación institucional de la identidad de quien responde.
- **Retención y tratamiento de datos**: requieren lineamientos institucionales antes de recolectar información real.

Para probar: [Manual del MVP](COMO_PROBAR_MVP.md). Para reglas y arquitectura: [Especificación funcional](ESPECIFICACION_FUNCIONAL_MVP.md).
