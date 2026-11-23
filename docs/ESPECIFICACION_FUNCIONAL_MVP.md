# FORJA — Especificación funcional del MVP

**Estado a noviembre de 2026:** requisitos levantados con el equipo y capacidades disponibles en la rama `forja/primera-etapa-backend`. Es un **MVP para pruebas locales**, todavía no un sistema institucional autorizado para tratar datos reales. Los ítems pendientes se identifican expresamente.

## 1. Conceptos y alcance

**Proyecto**: iniciativa de aprendizaje-servicio con código FORJA estable. Tiene título, comunidad u organización, problema/objetivo general, justificación, zonas territoriales, ODS, población predominante y estado general (`ACTIVO` / `FINALIZADO`).

**Período académico (semestre)**: una ocurrencia del proyecto en un año y semestre (`2026-2`, por ejemplo), con profesor responsable, asignatura, facultad, departamento académico, programa principal, actividades, presupuesto, estudiantes, evidencias, resultados, conclusiones y estado propio. El proyecto conserva su código al continuar o reactivarse. Una misma combinación proyecto + año + semestre no se repite.

**Registro histórico**: digitalización de períodos anteriores con la información disponible, sin exigir aprobación retrospectiva ni completar campos desconocidos artificialmente. Un histórico aún activo puede pasar a un semestre actual con profesor asignado.

Los **estados por período** incluyen `BORRADOR`, `EN_REVISION`, `DEVUELTO`, `APROBADO` y, por separado, ejecución `PENDIENTE`, `EN_CURSO`, `CERRADO`. El administrador marca la finalización definitiva del proyecto; un semestre cerrado no finaliza automáticamente el proyecto.

## 2. Roles

| Rol | Flujo esperado |
| --- | --- |
| **Administrador** | Crea cuentas, gestiona catálogo territorial/asignaturas, decide aprobación/devolución por semestre, revisa evidencias, cierra períodos, finaliza proyectos, almacena cartas firmadas, genera enlaces comunitarios y descarga reportes Excel. |
| **Profesor** | Registra proyectos nuevos o continúa proyectos existentes, crea períodos actuales, ingresa los datos requeridos, envía a revisión, aporta evidencias PDF y resultados. |
| **Monitor** | Registra proyectos y semestres históricos, incluyendo profesor histórico sin cuenta, documentos existentes y campos faltantes; no debe inventar información ni aprobar períodos anteriores. |
| **Comunidad** | Responde un formulario al término de **cada semestre**, mediante un enlace privado y sin cuenta de usuario. |

**Cuentas:** las crea el administrador; no hay registro público de docentes. La primera cuenta administrativa se crea con `bootstrap-admin.mjs`. El cambio obligatorio de contraseña inicial y recuperación de contraseña son requerimientos pendientes; no describirlos como implementados.

## 3. Campos y catálogos

| Sección | Datos principales | Periodicidad |
| --- | --- | --- |
| Información general | Título, código, problemática, objetivo general, justificación, comunidad, ubicación/contacto, fecha de inicio, duración y **zonas territoriales**. | Proyecto |
| Consideraciones éticas | Población externa predominante, población universitaria, contacto/datos personales, tratamiento de imagen, medidas de privacidad, mitigación, declaración de veracidad; **17 ODS** en esta sección. | Análisis asociado al proyecto |
| Período académico | Año, semestre, profesor, asignatura, facultad, departamento académico de los estudiantes, programa/carrera, objetivos, actividades, presupuesto, fechas y cantidad de estudiantes. | Semestre |
| Ejecución | Evidencias PDF, resultados, conclusiones y revisiones. | Semestre |
| Carta final firmada | Solo archivo **PDF firmado**; la carta se redacta fuera de la plataforma. | **Cada semestre** |
| Evaluación comunitaria | Cuestionario institucional de 19 preguntas, incluidas 14 afirmaciones Likert. | **Cada semestre** |

### Catálogos y campos de selección

- **Zonas FORJA:** catálogo institucional de **siete zonas** (nombres por aportar y validar). Una iniciativa puede vincularse a varias zonas; el desplegable permite selección múltiple. No confundir con el departamento académico universitario ni con una división administrativa de Colombia.
- **ODS:** son los **17 Objetivos de Desarrollo Sostenible**. Pueden seleccionarse varios. No hay «once compromisos de sostenibilidad» como categoría distinta.
- **Facultad, departamento y programa/carrera:** desplegables basados en las tablas locales de Javeriana Cali. La interfaz asocia **un programa principal por semestre**. El requisito de incluir varias carreras en un semestre simultáneamente aún necesita modelarse.
- **Población externa predominante:** se selecciona **una** categoría desde consideraciones éticas; alimenta los filtros administrativos.
- **Beneficiarios:** hay campos descriptivos de población e información agregada; la desagregación sistemática por edades, géneros y otros grupos, así como totales no duplicados, **no está íntegramente implementada**.

## 4. Flujo del semestre actual

1. El profesor crea o abre proyecto activo y registra un semestre `ACTUAL`.
2. Guarda borrador; completa problemática, objetivo, comunidad, objetivos y actividades del semestre, fechas, curso, presupuesto, estudiantes y consideraciones éticas.
3. Envía el semestre a revisión (`EN_REVISION`). El backend verifica requisitos.
4. El administrador aprueba (`APROBADO`) o devuelve (`DEVUELTO`) con observaciones.
5. En ejecución, el profesor adjunta evidencias **PDF**, máximo 20 MB cada una; el administrador aprueba o devuelve cada archivo.
6. El profesor registra resultados y conclusiones.
7. El administrador cierra el período después de contar con resultados, conclusiones, al menos una evidencia PDF aprobada y ninguna evidencia pendiente.
8. Fuera del sistema, FORJA prepara y firma la carta final; el administrador sube el PDF firmado al **semestre**.
9. El administrador genera enlace privado para la **evaluación comunitaria del semestre**.
10. El proyecto continúa activo hasta que el administrador lo marque finalizado. Un nuevo semestre requiere su propia aprobación.

**Importante:** carta firmada y evaluación no son requisitos para crear o enviar inicialmente el semestre. La documentación histórica no necesita pasar nuevamente por estas validaciones.

## 5. Digitalización histórica

- El monitor registra proyectos `HISTORICO` y sus semestres anteriores sin exigir los documentos faltantes.
- Puede consignar el nombre del profesor antiguo sin crearle cuenta y anotar «información faltante».
- Puede adjuntar evidencias PDF y cartas firmadas que realmente existan.
- Cuando el histórico sigue **activo**, el administrador asigna un profesor con cuenta; ese profesor registra el semestre actual que sí pasa por revisión.
- Se conservan código de proyecto, semestres anteriores y documentos de cada período.

## 6. Evaluación comunitaria institucional

**Fuente disponible:** formulario institucional de Microsoft Forms entregado al equipo (referencia: `https://forms.cloud.microsoft/r/G80nKymrML`) y su copia PDF de siete páginas. **Se diligencia una vez por semestre**, no por proyecto.

El instrumento tiene 19 preguntas: identificación y contacto; tipo de socio; ubicación; profesor/asignatura y proyecto; problemática; cantidades de estudiantes y participantes comunitarios; encuentros, productos e impactos; **14 afirmaciones con cinco opciones**; línea de acción (cinco); obstáculos, continuidad, futuras iniciativas y comentarios opcionales.

FORJA autocompleta el **semestre evaluado** mediante el enlace del período para evitar seleccionarlo incorrectamente. Al generar el enlace se crea un token aleatorio de 256 bits; solo su hash queda almacenado. Es de un único uso y expira a los 14 días. El administrador puede regenerarlo antes de recibir una evaluación; ello invalida el anterior. Después de una respuesta no se genera otra para el mismo semestre.

`community_period_feedback.form_version` diferencia respuestas de la prueba inicial (`MVP_2026`) y del instrumento institucional (`INSTITUCIONAL_2026`) sin borrar los datos previamente recibidos.

**Privacidad pendiente:** el formulario recoge nombre y datos de contacto; hace falta revisar aviso de privacidad, autorización, retención, acceso y seguridad antes de utilizarlo con comunidades reales.

## 7. Filtros y reportes

En el listado se pueden combinar los siguientes criterios:

- **Año de inicio del proyecto**: año más antiguo entre fecha general de inicio y primeros períodos académicos; si ambos faltan, año de registro como referencia (en históricos incompletos es una aproximación).
- Zona territorial FORJA.
- Facultad no es todavía un filtro del listado; sí **departamento académico** y **carrera/programa** (la combinación debe corresponder al mismo semestre).
- Los 17 ODS.
- Población externa predominante.

Solo el administrador descarga un **Excel `.xlsx` con los filtros aplicados**, en dos hojas: «Proyectos» y «Semestres». Se incluyen estados, zonas, ODS, datos académicos, cantidad de estudiantes por período y presupuesto. Se excluyen datos de contacto y respuestas nominativas comunitarias.

La suma de estudiantes a lo largo de los semestres **no cuenta estudiantes únicos**.

## 8. Evidencias y seguridad

Solo se permiten PDFs de hasta 20 MB; las fotos pueden incorporarse en el PDF y los videos referenciarse mediante URL en el documento. Los archivos se almacenan en un directorio privado. La verificación de firma PDF, MIME y extensión no equivale a antivirus.

La información de usuarios se restringe por rol y relaciones de proyecto. Falta asegurar despliegue público con HTTPS, respaldo y restauración comprobada, límites de solicitudes de formularios públicos y medidas de seguridad adecuadas para datos personales.

## 9. Requisitos todavía no confirmados o implementados totalmente

- Catálogo oficial con **nombres de siete zonas**.
- Múltiples carreras simultáneas por semestre y desglose de estudiantes por carrera, si la institución lo solicita.
- Modelo de beneficiarios desagregados por categorías y métricas oficiales de impacto.
- Políticas definitivas de permisos y documentos adicionales, protección de datos, retención y cambio de contraseña inicial.
- Revisión institucional final de textos del formulario y de otros documentos.
- Pruebas integrales automatizadas; publicación institucional segura.

Para ver qué se ha probado y qué falta: [Estado de implementación](ESTADO_IMPLEMENTACION.md) y [Manual de pruebas](COMO_PROBAR_MVP.md).
