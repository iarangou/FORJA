# FORJA — Aplicación web Next.js

Frontend de FORJA, desarrollado en **Next.js 16** con App Router y React 19. Se conecta al backend NestJS usando rutas proxy `app/api`. Las consultas privadas se autorizan con la sesión obtenida al iniciar sesión.

**Para levantar toda la plataforma, usar Docker desde la raíz:** [README principal](../README.md). Para un equipo nuevo: [Instalación para compañeros](../docs/INSTALACION_COMPANEROS.md).

## Iniciar el frontend y backend

~~~powershell
cd Docker
docker compose -p forja-dev --env-file .env.dev -f compose.dev.yml up -d --build
~~~

Navegador: **http://localhost:3000**. El API corre internamente en `http://backend:3001`, configurado con `INTERNAL_API_URL` en Compose. No subir `.env.dev` ni exponer secretos en variables `NEXT_PUBLIC_*`.

También se puede trabajar directamente con `npm run dev` desde `forja_frontend/`, **siempre que** NestJS, PostgreSQL y las variables de conexión estén configurados. El método soportado para pruebas del equipo es Docker Compose.

## Páginas de la plataforma

| Ruta | Acceso / función |
| --- | --- |
| `/login` | Inicio de sesión; **no hay registro público de profesores**. |
| `/proyectos` | Listado de proyectos visibles, filtros y estados; botón Excel para administrador. |
| `/proyectos/nuevo` | Formulario nuevo (profesor) o histórico (monitor). |
| `/proyectos/[projectId]` | Editor en acordeones: información general, períodos, consideraciones éticas, evidencias, resultados, carta final firmada y evaluación comunitaria. |
| `/administracion/usuarios` | Administración de usuarios y asignaturas (rol 1). |
| `/administracion/catalogos` | Catálogo de zonas territoriales FORJA y referencia de los 17 ODS (rol 1 para edición de zonas). |
| `/evaluacion-comunitaria/[token]` | Formulario de la comunidad **sin cuenta**; evalúa el semestre contenido en el enlace. |

### Filtros y Excel

La pantalla de proyectos tiene selectores de **año de inicio**, **zona territorial**, **departamento académico**, **programa/carrera**, **ODS** y **población externa predominante**. Se combinan entre sí. Los años disponibles provienen de los proyectos visibles.

Solo el administrador puede descargar `FORJA_reporte_filtrado.xlsx`. El archivo se genera con los mismos criterios en `app/api/projects/export/route.ts` y contiene dos hojas: «Proyectos» y «Semestres». La suma de estudiantes por proyecto representa cantidades por períodos, **no estudiantes únicos**. El Excel no exporta datos nominativos de la comunidad.

### Evaluación comunitaria

La evaluación institucional contiene **19 preguntas**, entre ellas una matriz de **14 afirmaciones** tipo Likert con cinco opciones y una selección de línea de acción. El administrador genera un enlace diferente **por semestre**; se recibe una sola respuesta y el token expira a los 14 días. Se guarda la carta firmada en otra sección del mismo semestre: no son el mismo documento ni el mismo flujo.

El período se obtiene automáticamente del enlace; no debe permitirse elegir otro manualmente. Las respuestas de pruebas con la primera versión del cuestionario se conservan mediante `form_version`.

### Catálogos

- Las siete **zonas territoriales** FORJA deben registrarse con nombres oficiales desde el administrador; se seleccionan con desplegable multiselección en Información general.
- Los **17 ODS** son un conjunto fijo de opciones, independiente del catálogo de zonas. Se guardan en el proyecto y pueden filtrarse.
- Facultades, departamentos académicos y programas de la Pontificia Universidad Javeriana Cali proceden de PostgreSQL, a través de `/api/faculty`, `/api/faculty/departments` y `/api/faculty/programs`.
- Por ahora cada semestre registra **un programa/carrera principal**.

## Componentes y archivos relevantes

- `components/projects/ProjectDetailEditor.tsx`: formulario unificado para profesor/monitor y acordeones del proyecto.
- `components/projects/NewProjectForm.tsx`: creación inicial.
- `components/projects/ClassificationPicker.tsx`: desplegables multiselección de zona y ODS.
- `components/projects/CommunityFeedbackSection.tsx`: enlace y consulta de respuestas.
- `lib/community-questionnaire.ts`: preguntas, matriz Likert y líneas de acción.
- `lib/ods.ts`: nombres de los 17 ODS.
- `lib/external-population.ts`: categorías de población externa.
- `lib/xlsx-export.ts`: generador de XLSX usado por la ruta de exportación.
- `lib/serverApi.ts`: proxy HTTP hacia NestJS con token de sesión.

## Verificación

~~~powershell
cd forja_frontend
npm ci
npm run build
~~~

La validación anterior verifica la compilación, pero **no** sustituye pruebas con PostgreSQL y los contenedores. Para casos funcionales de todos los roles y descarga Excel, seguir [COMO_PROBAR_MVP.md](../docs/COMO_PROBAR_MVP.md).

**Antes de producción:** revisar accesibilidad, permisos de datos comunitarios, protección del formulario público, gestión de archivos y configuración HTTPS.
