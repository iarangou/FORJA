# FORJA — Estado del desarrollo (22 de noviembre de 2026)

> Este documento distingue código implementado, flujo pendiente y supuestos. El hecho de que exista un endpoint no implica que haya sido probado con datos reales ni que el proceso institucional esté validado.

## Implementado en la rama `forja/primera-etapa-backend`

| Área | Implementación en esta etapa |
|---|---|
| Proyectos | Alta y consulta con código único autogenerado, título, problemática, objetivo, justificación, organización y ODS |
| Acceso | Autenticación JWT existente; bloqueo del autorregistro; bootstrap seguro del primer administrador |
| Permisos | Roles aplicados a rutas de proyectos; profesor ve proyectos propios/asignados, administrador y monitor acceden para su labor |
| Períodos | Registro por año-semestre con estado de aprobación independiente; separación actual/histórico |
| Digitalización histórica | Monitor registra y corrige semestres anteriores con datos incompletos y puede adjuntar evidencias PDF sin revisión retroactiva; administrador asigna profesor responsable para continuidad del semestre actual |
| Ética | Formulario de categorías agregadas y medidas de privacidad; almacenamiento inicial por proyecto |
| Revisión | Profesor solicita aprobación; administrador aprueba/devuelve y guarda historial de decisiones |
| Ejecución y cierre | Profesor guarda resultados y conclusiones de semestre aprobado; administrador cierra tras comprobar al menos un PDF aprobado y ninguno pendiente |
| Finalización general | Administrador finaliza proyecto únicamente si los períodos actuales están aprobados y cerrados; no elimina el historial |
| Carta final comunitaria | Administrador o monitor archiva una carta final firmada en PDF por cada semestre. Para el semestre actual, se sube después de cerrarlo; para períodos históricos se digitaliza sin aprobación retroactiva. |
| Interfaz | `/proyectos` y `/proyectos/nuevo`; acceso desde login y consulta de períodos |
| Infraestructura | Migraciones SQL incrementales de desarrollo y Action de comprobación de compilación |
| Documentación | Especificación asumida, checklist documental, ejemplo ficticio y guía de instalación |

## Pendientes funcionales relevantes

- Edición de borradores guardados y correcciones después de devolución (PATCH por período y proyecto)
- Carga, consulta y revisión segura de documentos/evidencias y carta final firmada
- Panel administrativo para crear profesores y monitores, cambio obligatorio de contraseña temporal
- Incorporar múltiples asignaturas/profesores/carreras por período y catálogo definitivo de siete territorios
- Gestión real de ODS, población beneficiaria y presupuestos pormenorizados en formularios
- Pruebas en Docker del formulario comunitario de respuesta única con enlace/token seguro
- La finalización general por administrador se implementó con confirmación y bloqueo de períodos actuales abiertos. Pendiente probarla con Docker, revisar reglas especiales para históricos y confirmar requisitos con FORJA.
- Exportar informes Excel por territorio; permisos de descarga y backups verificados
- Integración y pruebas con PostgreSQL y Docker, tests de API, revisión de validaciones/seguridad

## Precauciones conocidas

- Existe carga de evidencias **exclusivamente PDF** vinculadas al semestre aprobado, descarga autenticada y revisión administrativa; falta validación integral en Docker y antimalware antes de producción.
- El envío a revisión no está condicionado a avales automáticos por tipo de población. El administrador aprueba o devuelve después de revisar la información.
- El formulario ético es una propuesta basada en el archivo disponible; no afirmar que es un formato institucional oficial definitivo.
- La cuenta admin se crea manualmente con `npm run bootstrap:admin`; la base nueva no instala usuarios con claves de prueba.
- Los scripts de `/docker-entrypoint-initdb.d/` se ejecutan automáticamente **solo en bases nuevas**. No resetear bases con datos.
- CI valida compilación cuando termine de ejecutarse; no sustituye pruebas end-to-end ni aprobación de FORJA.
- El PR #1 está abierto como **borrador** y no debe fusionarse a `main` antes de revisar las comprobaciones.

## Próximas prioridades recomendadas

1. Endpoint seguro de actualización de borradores, períodos y resubmisión.
2. Carga documental con almacenamiento no público y validación de tipos, límites y permisos.
3. Panel de administrador y profesor completo con edición.
4. Evaluación comunitaria + exportaciones.
5. Pruebas funcionales y endurecimiento para despliegue.

La meta es lograr coherencia entre requisitos, datos, backend y pantallas sin inventar procesos institucionales que nunca fueron suministrados.

## Cómo probar la digitalización histórica

1. Como administrador, crear una cuenta de monitor en `/administracion/usuarios`.
2. Ingresar con el monitor y crear un proyecto tipo **Histórico** en `/proyectos/nuevo` con, por ejemplo, el período 2024-2. Los campos desconocidos quedan vacíos y se explican en «Información faltante».
3. Abrir el proyecto, desplegar **Digitalización histórica**, registrar otro período anterior y comprobar que no requiere aprobación retroactiva.
4. Ingresar como administrador, abrir el mismo proyecto y asignar un profesor responsable en esa sección. Si el proyecto histórico sigue activo, el profesor podrá abrir un período **ACTUAL**.
5. Como profesor, crear el período 2026-2, completar sus campos y el análisis ético. Enviarlo a aprobación administrativa por el procedimiento habitual. No modificar los períodos históricos para simular el semestre actual.

**No se deben ejecutar resets de la base para estas pruebas.** La función de asignación de docente no permite reasignar desde la interfaz una vez registrado un período actual. Las reglas especiales para casos históricos excepcionales requieren validación con FORJA antes de producción.

## Documentación al finalizar (MVP)

- En los períodos históricos, el monitor o administrador puede subir evidencias antiguas PDF (máximo 20 MB). No se exigen revisiones retroactivas: el estado de revisión de la tabla documental no representa una aprobación pendiente para esos archivos.
- Los documentos de ejecución actual siguen el flujo de aprobación del profesor y administrador ya probado.
- La **carta final firmada por la comunidad** se prepara y firma fuera de FORJA y se archiva una vez por semestre (PDF, máximo 20 MB). La carga corresponde al administrador o monitor; el profesor autorizado puede consultarla. Cada archivo queda asociado a project_periods.id usando el almacenamiento privado existente.
- La carta del semestre actual se adjunta después de cerrar ese semestre, sin depender del estado de los demás semestres. En períodos históricos puede archivarse la carta existente sin exigir cierre retroactivo. El cierre general no requiere automáticamente una carta; está pendiente confirmar con FORJA si debería ser obligatoria.
- Aún no hay detección de malware ni validación criptográfica de firmas digitales; el administrador debe verificar el documento. No usar datos personales reales en pruebas locales.

## Edición completa de registros históricos

- El monitor puede editar **01. Información general** y registrar datos históricos en **03. Digitalización histórica**: profesor original (nombre textual, no requiere una cuenta), facultad, programa/carrera, asignatura, año-semestre, fechas, estudiantes, presupuesto, territorio, población participante, objetivos, actividades, resultados, conclusiones y faltantes. También puede registrar el contexto ético disponible sin declaraciones obligatorias ni envío a aprobación.
- Los períodos históricos siguen separados del período actual. Los campos de la ficha histórica que no se conocen son opcionales: una cadena vacía o NULL representa **desconocido**, no cero ni una respuesta afirmativa/negativa. La excepción es la identificación mínima del proyecto y del período (título, año y semestre).
- Las asignaturas, carreras y facultades existentes se seleccionan de catálogos. Si el docente histórico ya no está vinculado a la universidad o no existe en el sistema, su nombre se conserva en `project_periods.historical_teacher_name`, sin crear una cuenta ficticia.
- **Migración requerida en bases ya inicializadas:** ejecutar una única vez el script idempotente `Docker/database/migrations/20261122_historical_teacher.sql` después de un respaldo, antes de actualizar backend/frontend. Para bases nuevas, el campo ya está en `zzz_forja_forms_and_reviews.sql`. Esta migración no modifica documentos ni estados.
- La edición de proyectos generales se mantiene restringida cuando existe un período actual en revisión o aprobado, para no cambiar información que ya fue revisada. Los datos históricos por semestre siguen editables para monitor/administrador mientras el proyecto esté activo.

## Formulario compartido (profesor y monitor)

- La sección **02. Períodos académicos** es el formulario de información académica tanto para docentes (semestres ACTUALES) como para monitores (semestres HISTORICOS): asignatura, facultad, programa, estudiantes, presupuesto, fechas, objetivos, actividades, población beneficiada y territorio.
- En un semestre HISTORICO aparecen además: nombre textual del profesor de aquella época, resultados, conclusiones y listado de información faltante. Un dato que no se conoce se deja vacío y se conserva como NULL cuando corresponde. No se solicita validación ni aprobación del administrador.
- La sección **03. Digitalización histórica** se limita a agregar otros semestres anteriores y, para administradores, asignar un profesor que continúe un proyecto activo. Se eliminó el segundo formulario duplicado de datos académicos.
- Las evidencias y la carta final siguen asociadas al semestre seleccionado y se cargan por separado como PDF.
- Si el semestre es ACTUAL, la aprobación, revisión de evidencias, resultados y cierre administrativo funcionan como antes.

## Evaluación comunitaria (MVP en pruebas)

- Una única respuesta por **semestre** para cada proyecto. La carta firmada y las evidencias también corresponden a cada semestre, pero se archivan como PDF independientes.
- El administrador genera o regenera un enlace privado de un solo uso, con token aleatorio de 256 bits, hash SHA-256 guardado en base de datos y validez de 14 días. Regenerar invalida el enlace anterior. El token completo solamente se muestra al generarlo.
- La comunidad abre el enlace sin crear cuenta. Puntúa objetivos, utilidad y participación del 1 al 5; puede indicar nombre de organización, relación con el proyecto y comentarios. Se solicita consentimiento explícito. El cuestionario es **propuesto**, no un instrumento oficial suministrado por FORJA.
- La respuesta se guarda de manera transaccional; la base impide respuestas duplicadas mediante restricción UNIQUE por semestre. Usuarios autorizados ven resultados en la sección desplegable «Evaluación de la comunidad».
- **Migración para bases existentes:** respaldar y ejecutar `Docker/database/migrations/20261122_community_feedback.sql` mediante psql antes de iniciar el módulo. Los archivos de inicialización de PostgreSQL solo se ejecutan al crear una base nueva.
- Antes de producción: acordar el cuestionario con FORJA, añadir límites de peticiones para proteger el enlace, revisar privacidad y política de conservación de respuestas. Nunca usar información sensible real en las pruebas locales.

### Prueba sugerida
1. Como administrador, abrir un proyecto ficticio, seleccionar un semestre histórico (o un semestre actual ya cerrado) y desplegar «Evaluación de la comunidad del semestre».
2. Generar enlace y copiarlo; abrirlo en ventana privada sin iniciar sesión.
3. Diligenciar puntuaciones 1–5 y consentimiento; enviar.
4. Intentar reutilizar el enlace: debe bloquearse. Volver al administrador: debe mostrarse la respuesta correspondiente únicamente al semestre seleccionado. Otro semestre del mismo proyecto todavía debe poder recibir su propia evaluación.

### Corrección importante del alcance comunitario

El requisito definitivo indicado por el usuario es: **la comunidad evalúa una vez al finalizar CADA SEMESTRE**, no una sola vez por proyecto. Cada `project_periods.id` tiene su propio token, respuesta, fecha y valoración. Los períodos históricos pueden recuperar sus evaluaciones cuando existan; no requieren aprobación retroactiva. Los semestres actuales solo habilitan la generación del enlace una vez aprobados y cerrados. La carta final firmada también se almacena una vez por semestre en PDF.

El script `20261122_community_feedback.sql` ahora crea tablas `community_period_feedback` y `community_period_feedback_links`. No ejecuta cambios destructivos. Si la versión anterior del script por proyecto llegó a ejecutarse, sus tablas quedan conservadas y sin uso; no se elimina ni traslada automáticamente ninguna respuesta antigua, que requiere una revisión antes de migrarla.

## Zonas territoriales y compromisos de sostenibilidad (23 de noviembre de 2026)

- Las zonas territoriales FORJA (siete identificadas, nombres oficiales pendientes) se seleccionan en **01. Información general**, por proyecto. Un proyecto puede asociarse a varias zonas porque el MER admite varios territorios.
- **Corrección:** el usuario aclaró que se refería a los 17 ODS, no a once compromisos diferentes. Los ODS se seleccionan en **Consideraciones éticas** y se almacenan en `project.ods_ids`.
- Tanto el profesor como el monitor usan estos campos; los registros históricos pueden dejar selecciones vacías cuando se desconocen. La edición se bloquea si existe un semestre actual en revisión o aprobado.
- El administrador debe cargar los siete nombres territoriales reales en `/administracion/catalogos` antes de seleccionarlos. Los ODS ya vienen con sus 17 nombres y IDs 1–17.
- Las zonas se guardan en `forja_territories` y sus relaciones en `project_territories`; los ODS se guardan en `project.ods_ids`. Los listados incluyen `zone_ids` y `ods_ids` para filtrar en `/proyectos`.
- Para bases ya inicializadas, **respaldar y ejecutar** `Docker/database/migrations/20261123_zones_sustainability.sql` con `psql` antes de reiniciar frontend y backend. Es idempotente y no borra datos. Para bases nuevas se incluye la definición en `zzz_forja_forms_and_reviews.sql`.
- La selección de clasificaciones y el guardado de datos generales/éticos se realizan mediante solicitudes HTTP distintas; si una falla, las otras podrían haberse guardado. Antes de producción conviene crear un endpoint transaccional combinado y pruebas automatizadas de consistencia.
- **Por probar en Docker:** crear zonas como administrador, guardar selecciones por zona y ODS como profesor y monitor, añadir departamento y carrera por semestre, reabrir el proyecto y filtrar. Para reportes Excel falta el módulo de exportación.

## Corrección de catálogos académicos y ODS (23 de noviembre de 2026)

- **ODS:** No existe un catálogo institucional adicional de 11 compromisos. El requisito corresponde a los **17 Objetivos de Desarrollo Sostenible**. Se reutiliza `project.ods_ids`, que ya existía, y el frontend muestra los nombres oficiales en un desplegable de selección múltiple en **Consideraciones éticas**. Se deshabilitaron los endpoints que ofrecían el catálogo duplicado de compromisos. Una instalación que creó las tablas del intento anterior las conserva por seguridad, pero la aplicación no las utiliza.
- **Zona territorial FORJA:** En **Información general**, desplegable de selección múltiple que obtiene nombres de `forja_territories` (pendiente ingresar los siete nombres institucionales). Asociación mediante `project_territories` a nivel de proyecto. No confundir con departamento académico de los estudiantes.
- **Departamento académico de los estudiantes:** Se usa el catálogo `department` ya existente, asociado a la facultad. Se almacena `project_periods.department_id`. La columna se añade en la migración idempotente `Docker/database/migrations/20261123_zones_sustainability.sql`.
- **Carrera/programa académico:** Se reutiliza el catálogo `academic_programs` existente, dependiente de facultad, con desplegable para ambos roles. En esta etapa se almacena un programa principal por semestre en `project_periods.academic_program_id`; sigue pendiente modelar formalmente *varias carreras simultáneas* por semestre si se confirma esa necesidad en interfaz y base de datos.
- Los campos académicos se presentan tanto al **profesor** como al **monitor**; para registros históricos pueden quedar vacíos cuando se desconocen. No se exigen aprobaciones retroactivas.
- El listado `/proyectos` permite filtrar por **zona, ODS, departamento académico y carrera** mediante campos desplegables, usando las relaciones existentes y nuevas.
- La sección `/administracion/catalogos` permite registrar las zonas territoriales reales. Los 17 ODS se muestran como lista fija de referencia y no necesitan configuración administrativa.
- La migración corregida es **no destructiva**, aunque debe hacerse un respaldo y aplicarse antes de reconstruir backend/frontend. Los cambios aún necesitan prueba funcional en Docker para confirmar persistencia de selecciones y filtros.
