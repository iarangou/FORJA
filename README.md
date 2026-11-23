# FORJA — Plataforma de gestión de proyectos

**FORJA** es una aplicación web para registrar, revisar y consultar proyectos de aprendizaje-servicio desarrollados con comunidades, organizados por **proyecto** y por **semestre académico**. Implementación en desarrollo; **no es un despliegue institucional de producción**.

**Stack:** Next.js 16 (frontend), NestJS 12 (API), PostgreSQL 17 y Docker Compose. La rama utilizada para pruebas es [`forja/primera-etapa-backend`](https://github.com/iarangou/FORJA/tree/forja/primera-etapa-backend), con cambios reunidos en el [PR #1](https://github.com/iarangou/FORJA/pull/1).

## Empezar

Para una instalación nueva en Windows, consultar **[Instalación para compañeros](docs/INSTALACION_COMPANEROS.md)**: incluye preparación de Docker Desktop, copia de `Docker/.env.dev.example`, variables y primer administrador.

Si **ya tienes** una copia configurada, desde la raíz del repositorio:

~~~powershell
git pull origin forja/primera-etapa-backend
cd Docker
docker compose -p forja-dev --env-file .env.dev -f compose.dev.yml up -d --build --force-recreate backend frontend
~~~

La aplicación DEV se abre en **http://localhost:3000**. Otros servicios locales: API `localhost:3001`, PostgreSQL `localhost:5433` y Adminer `localhost:8080` (si los puertos están disponibles).

> **Importante:** `git pull` actualiza el código, pero **no** ejecuta migraciones de una base PostgreSQL ya inicializada. Ver la sección «Base de datos». Para instalaciones existentes nunca usar `reset-db`, borrar `Docker/database/data/dev` ni `docker compose down -v` para aplicar cambios.

## Roles y alcance funcional

| Rol | Funciones disponibles |
| --- | --- |
| **Administrador** (1) | Gestiona cuentas, catálogos de zonas y asignaturas; revisa/aprueba/devuelve semestres y evidencias actuales; cierra semestres, finaliza proyectos, asigna profesor a históricos activos, archiva cartas firmadas, genera enlaces comunitarios y exporta reportes. |
| **Monitor** (2) | Digitaliza proyectos y períodos **históricos**, registra información incompleta y documentos disponibles, sin aprobación retroactiva. |
| **Profesor** (3) | Registra proyectos y semestres actuales; completa planeación, ética y clasificación; envía a revisión; carga evidencias y resultados de los períodos que gestiona. |
| **Comunidad** (sin cuenta) | Responde mediante un enlace privado una **evaluación por semestre**. |

Un proyecto conserva su **código FORJA** cuando continúa en otros semestres. El estado general del proyecto (`ACTIVO` / `FINALIZADO`) es distinto de la aprobación y cierre de cada período. Un período histórico previo no necesita pasar retrospectivamente por la aprobación; un semestre actual sí.

### Módulos implementados para pruebas locales

- Registro y edición de proyectos; nuevo e histórico, períodos y docente responsable.
- Información general, zonas territoriales FORJA (catálogo administrable), **17 ODS**, facultad, departamento académico, carrera/programa y asignatura.
- Consideraciones éticas, incluida **población externa predominante**.
- Revisión de períodos actuales (`BORRADOR`, `EN_REVISION`, `DEVUELTO`, `APROBADO`), seguimiento de evidencias PDF y cierre.
- Evidencias **PDF de hasta 20 MB**; carta final **firmada en PDF por semestre**, elaborada fuera del sistema.
- Evaluación comunitaria institucional de **19 preguntas**, incluida una matriz de 14 afirmaciones con cinco respuestas. Enlace de un solo uso por semestre.
- Listado de proyectos con filtros por **año de inicio, zona, departamento, carrera, ODS y población externa predominante**; exportación administrativa `.xlsx` con hojas **Proyectos** y **Semestres**.

**Limitaciones a considerar:** todavía se requiere validar privacidad y conservación de información personal, fortalecer el despliegue para Internet, confirmar los siete nombres oficiales de zonas y modelar si cada semestre debe asociarse simultáneamente a varias carreras (hoy tiene una principal). Los totales de estudiantes por proyecto son **suma de registros semestrales**, no personas únicas. La compilación en GitHub no reemplaza pruebas end-to-end y de seguridad.

## Documentación

| Documento | Para qué sirve |
| --- | --- |
| [Instalación para compañeros](docs/INSTALACION_COMPANEROS.md) | Clonar, crear `.env.dev`, iniciar Docker y crear la primera cuenta. |
| [Manual de pruebas MVP](docs/COMO_PROBAR_MVP.md) | Recorrido de prueba por administrador, profesor, monitor y comunidad; filtros y Excel. |
| [Especificación funcional](docs/ESPECIFICACION_FUNCIONAL_MVP.md) | Reglas confirmadas, modelo de semestres y puntos pendientes de validación. |
| [Estado de implementación](docs/ESTADO_IMPLEMENTACION.md) | Módulos terminados, riesgos y próximos pasos. |
| [Checklist documental](docs/CHECKLIST_DOCUMENTAL_ASUMIDO.md) | Documentos por período y diferencias entre exigencias del código y supuestos. |
| [Mapeo de ética](docs/FORMATO_ETICO_MAPEO.md) | Campos del documento de origen frente al formulario implementado. |
| [Backend y API](forja_back-end/README.md) | Endpoints y permisos reales de NestJS. |
| [Frontend](forja_frontend/README.md) | Páginas y rutas Next.js, ejecución y navegación. |

## Base de datos y persistencia

**Instalación nueva:** PostgreSQL ejecuta los SQL de `Docker/database/init/` solamente cuando `Docker/database/data/dev` está **vacío**. El fichero `01_init.sql` es apenas un diagnóstico; el esquema de negocio también está en `create_tables.sql`, `insert_values.sql` y los archivos `zz*.sql`.

**Instalación ya existente:** ejecutar solo las migraciones incrementales que **no** se hayan aplicado:

| Migración | Propósito |
| --- | --- |
| `20261122_historical_teacher.sql` | Profesor histórico registrado por nombre. |
| `20261122_community_feedback.sql` | Evaluaciones y enlaces **por semestre**. |
| `20261123_zones_sustainability.sql` | Zonas territoriales y departamento académico (no agrega un segundo catálogo de ODS). |
| `20261123_institutional_community_form.sql` | Preguntas institucionales y versión de formulario, sin eliminar respuestas previas. |

Desde `Docker/`, **respaldar primero** y aplicar únicamente la migración correspondiente:

~~~powershell
.\forja.ps1 dev backup-db
Get-Content -Raw .\database\migrations\NOMBRE_DEL_ARCHIVO.sql | docker compose -p forja-dev --env-file .env.dev -f compose.dev.yml exec -T database sh -c 'psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB"'
~~~

**Los SQL de migración no se aplican automáticamente ni deben ejecutarse a ciegas sobre bases reales.** Los PDFs y la base se conservan fuera del código en `Docker/evidence-storage/dev/` y `Docker/database/data/dev/`, respectivamente. No incluir estas carpetas, contraseñas, respaldos ni documentos privados en Git.

Para comprobar servicios y errores:

~~~powershell
docker compose -p forja-dev --env-file .env.dev -f compose.dev.yml ps
docker compose -p forja-dev --env-file .env.dev -f compose.dev.yml logs --tail=100 backend frontend database
~~~

El archivo `Docker/compose.prod.yml` habilita un **entorno de producción local** (normalmente puertos 3100 y 3101), **no** publicación en Internet. Configurar sus secretos por separado y no asumir que ya cuenta con los controles exigidos para datos comunitarios reales.

## Trabajo en equipo

Cada desarrollador usa su **propio `.env.dev`** (la plantilla está versionada sin secretos), su base local y usuarios ficticios. El administrador inicial se crea con `forja_back-end/scripts/bootstrap-admin.mjs`; no existen contraseñas predeterminadas ni registro público de profesores. Para compartir cambios, crear commits en la rama de trabajo y coordinar los merges mediante GitHub; evitar subir datos de prueba privados.
