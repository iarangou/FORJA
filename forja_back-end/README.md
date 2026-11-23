# FORJA — API NestJS (backend)

Backend de la plataforma FORJA, desarrollado en **NestJS 12**, TypeScript, PostgreSQL 17 y almacenamiento privado local de documentos PDF. Esta guía refleja los **controladores presentes en la rama de desarrollo**; no documenta endpoints antiguos eliminados.

**Inicio recomendado:** usar Docker Compose desde `FORJA/Docker` y la plantilla `.env.dev.example`, como se indica en el [README principal](../README.md).

## Roles

| ID | Rol | Responsabilidad |
| --- | --- | --- |
| `1` | `admin` | Usuarios, revisión/aprobación, cierre/finalización, catálogos, cartas, enlaces comunitarios e informes administrativos. |
| `2` | `monitor` | Digitalización de períodos históricos con información parcial; archiva archivos existentes sin aprobación retrospectiva. |
| `3` | `teacher` | Proyectos/períodos actuales, edición y envío a revisión, evidencias y resultados. |

Las rutas privadas requieren cabecera `Authorization: Bearer <access_token>`. Next.js actúa como proxy con una cookie de sesión HTTP-only; desde el navegador se usan las rutas `/api/...`.

**Registro de profesores:** no existe `POST /auth/register`, ni `/auth/verify-email` ni `/auth/resend-verification` en NestJS. El administrador crea cuentas a través de `POST /users/create`. No hay administrador predeterminado ni contraseña `12345678`. Para la primera cuenta se usa `scripts/bootstrap-admin.mjs`.

## Variables y arranque

Docker configura en backend: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`, `JWT_EXPIRES_IN_SECONDS` y `FORJA_UPLOAD_DIR`. Las variables deben estar en `Docker/.env.dev` (no versionadas), con secretos distintos por instalación.

~~~powershell
cd Docker
Copy-Item .env.dev.example .env.dev   # Solo primera instalación
# Editar .env.dev y establecer secretos propios.
docker compose -p forja-dev --env-file .env.dev -f compose.dev.yml up -d --build
~~~

Ejemplo para iniciar sesión en la **API**:

~~~http
POST /auth/login
Content-Type: application/json

{"username":"usuario_local","password":"contraseña_configurada"}
~~~

La respuesta incluye `access_token` y los datos básicos del usuario. La API utiliza la contraseña almacenada con hash; nunca se deben subir credenciales reales a GitHub.

## Endpoints implementados

### Autenticación, usuarios y catálogos

| Método y ruta NestJS | Acceso | Uso |
| --- | --- | --- |
| `POST /auth/login` | Público | Obtener JWT con usuario y contraseña. |
| `GET /users/me` | Autenticado | Consultar perfil propio. |
| `PATCH /users/me` | Autenticado | Actualizar nombre y, si es profesor, facultad. |
| `GET /users`, `GET /users/:id` | Admin | Consultar usuarios. |
| `POST /users/create` | Admin | Crear usuario profesor, monitor o administrador. |
| `POST /users/update`, `POST /users/delete` | Admin | Editar/retirar usuarios según restricciones de la base. |
| `GET /faculty`, `GET /faculty/departments`, `GET /faculty/programs` | Público | Catálogos de la Pontificia Universidad Javeriana Cali incluidos en la base de datos local. |
| `GET /course` | Admin / Monitor / Profesor | Listado de asignaturas. |
| `POST /course/create` | Admin | Crear asignatura del catálogo. |
| `GET /academic-programs` | Admin / Monitor / Profesor | Consultar programas académicos. |

Al crear un profesor mediante `/users/create` se requiere `faculty_id`. El backend valida correos del dominio javerianacali.edu.co; utilizar únicamente direcciones y personas autorizadas en entornos reales.

### Proyectos y períodos

Todos los endpoints siguientes comienzan por `/project`:

| Método + sufijo | Acceso | Acción |
| --- | --- | --- |
| `GET /`, `GET /:id` | 1, 2, 3 con controles de acceso | Listar/consultar proyectos visibles. |
| `POST /`, `PATCH /:id` | 1, 2, 3 según flujo | Crear/editar proyecto, incluyendo los 17 `ods_ids`. |
| `POST /:id/responsible-teacher` | Admin | Asignar profesor para continuar proyecto histórico activo. |
| `GET /:projectId/periods`, `POST /:projectId/periods` | 1, 2, 3 según flujo | Consultar y registrar semestres. |
| `PATCH /:projectId/periods/:periodId` | Admin / Profesor | Editar semestre actual editable. |
| `PATCH /:projectId/periods/:periodId/historical` | Admin / Monitor | Completar semestre histórico sin aprobación retroactiva. |
| `GET /:projectId/ethics`, `PUT /:projectId/ethics` | 1, 2, 3 según flujo | Consideraciones éticas y población externa predominante. |
| `POST /:projectId/periods/:periodId/submit` | Profesor | Solicitar revisión del semestre actual. |
| `POST /:projectId/periods/:periodId/review` | Admin | Aprobar/devolver semestre en revisión; dejar observaciones. |
| `GET /:projectId/periods/:periodId/reviews` | 1, 2, 3 | Ver historial de decisiones. |
| `PUT /:projectId/periods/:periodId/results` | Profesor | Guardar resultados y conclusiones. |
| `POST /:projectId/periods/:periodId/close` | Admin | Cerrar semestre actual aprobado con resultados y evidencia revisada. |
| `POST /:projectId/finalize` | Admin | Marcar finalización definitiva del proyecto. |
| `GET /report-periods` | Admin | Datos no nominativos de períodos para exportar Excel. |

Un proyecto puede continuar o reactivarse en varios semestres y conserva su código. **El administrador aprueba y cierra semestres por separado**. El monitor solo digitaliza historia; el semestre vigente se somete a revisión normal.

### Evidencias y cartas firmadas

Prefijo de evidencias: `/project/:projectId/periods/:periodId/evidences`.

| Método | Acceso | Uso |
| --- | --- | --- |
| `GET /` | Roles autorizados | Listar evidencias del período. |
| `POST /` | Profesor (período actual aprobado y abierto) / Admin o Monitor (histórico) | Enviar `multipart/form-data` con campo `file`, PDF máximo 20 MB. |
| `GET /:evidenceId/download` | Roles autorizados | Descargar PDF. |
| `POST /:evidenceId/review` | Admin | Aprobar o devolver evidencia actual; una evidencia ya revisada no se puede revisar de nuevo. |

Prefijo de carta: `/project/:projectId/periods/:periodId/final-letter`.

| Método | Acceso | Uso |
| --- | --- | --- |
| `GET /` | Roles autorizados | Consultar la única carta final del período. |
| `POST /` | Admin / Monitor | Archivar PDF final firmado de máximo 20 MB, **una carta por semestre**. Un período actual debe estar cerrado y aprobado; el histórico se archiva sin cierre retroactivo. |
| `GET /:letterId/download` | Roles autorizados | Descargar carta. |

**No hay generador ni editor de cartas dentro de FORJA:** la carta se redacta y firma fuera del sistema y se sube la versión definitiva.

### Zonas y ODS

Prefijo `/project-classifications`:

| Método | Acceso | Uso |
| --- | --- | --- |
| `GET /zones` | 1, 2, 3 | Consultar zonas territoriales. |
| `POST /zones` | Admin | Agregar nombre de zona al catálogo. |
| `GET /project/:projectId/zones` | 1, 2, 3 según proyecto | Consultar zonas asignadas. |
| `PUT /project/:projectId/zones` | 1, 2, 3 según proyecto | Reemplazar la selección; cuerpo `{"ids":[1,2]}`. |

Los **17 ODS** se guardan en `project.ods_ids` (valores 1–17); **no hay** un catálogo independiente de once compromisos de sostenibilidad. Los nombres de las siete zonas FORJA se deben cargar cuando la institución los confirme.

### Evaluación comunitaria institucional

Prefijo `/community-feedback`:

| Método y ruta | Acceso | Uso |
| --- | --- | --- |
| `GET /form/:token` | Público con token | Verificar enlace y recuperar código del proyecto y semestre. |
| `POST /form/:token` | Público con token | Enviar cuestionario institucional de 19 preguntas, incluyendo 14 afirmaciones Likert y autorización de almacenamiento. |
| `GET /project/:projectId/periods/:periodId` | 1, 2, 3 según proyecto | Consultar evaluación del **semestre seleccionado**. |
| `POST /project/:projectId/periods/:periodId/link` | Admin | Generar/regenerar enlace privado de un uso y vigencia de 14 días. |

Las respuestas están en `community_period_feedback` con restricción **única por período**, y los hashes de token en `community_period_feedback_links`. El token completo no se guarda en la BD. `form_version` permite distinguir pruebas anteriores (`MVP_2026`) y el instrumento institucional (`INSTITUCIONAL_2026`).

### Excel para administradores

La exportación `GET /api/projects/export` es una **ruta de Next.js**, no un controlador NestJS. Comprueba rol administrador y reúne `GET /project`, `GET /project/report-periods` y catálogos.

Filtros admitidos: `year`, `zone`, `ods`, `department`, `program` y `population`. El archivo `.xlsx` contiene dos hojas: **Proyectos** y **Semestres**, sin datos personales de contacto. El año es de **inicio del proyecto**, calculado con la fecha de inicio y el semestre más antiguo; cuando no se conocen, se toma como referencia el registro en el sistema.

## Base de datos

Esquema en `Docker/database/init/`; actualizaciones incrementales para bases existentes en `Docker/database/migrations/`.

**Jamás reinicializar PostgreSQL para aplicar una migración en una instalación con datos.** Respaldar primero y ejecutar cada migración pertinente; consultar el [README raíz](../README.md#base-de-datos-y-persistencia). El directorio de documentos `FORJA_UPLOAD_DIR` también requiere respaldo y permisos adecuados.

## Pendiente de validar antes de producción

- Autorización y conservación de datos personales de quienes responden la evaluación.
- Protección contra abuso del formulario público (límites por IP/tasa de envío).
- Verificación antivirus de PDF, HTTPS y auditoría de permisos.
- Reglas institucionales de catálogos y soporte de varias carreras simultáneas por semestre.
- Pruebas de integración, despliegue seguro y recuperación de fallos.

Para el recorrido guiado: [Cómo probar el MVP](../docs/COMO_PROBAR_MVP.md).
