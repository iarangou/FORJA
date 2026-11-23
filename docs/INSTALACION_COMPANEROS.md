# FORJA — Instalación para compañeros (Windows + Docker)

**Rama:** `forja/primera-etapa-backend`. Cada integrante usa **sus propias credenciales, base de datos y archivos de pruebas**. No es necesario enviar el `.env.dev` personal de nadie, ni copiar una base con datos de comunidades reales.

## 1. Requisitos

- Git y **Docker Desktop** iniciado (preferiblemente con WSL2).
- PowerShell y conexión a Internet para descargar imágenes/dependencias.
- Puertos libres en el equipo: **3000** (frontend), **3001** (backend), **5433** (PostgreSQL local) y **8080** (Adminer).

## 2. Descargar el código

~~~powershell
git clone -b forja/primera-etapa-backend https://github.com/iarangou/FORJA.git
cd FORJA\Docker
~~~

Si el repositorio ya existe, desde su raíz:

~~~powershell
git switch forja/primera-etapa-backend
git pull origin forja/primera-etapa-backend
cd Docker
~~~

## 3. Crear el archivo de variables

La plantilla **sí está subida a Git**, pero tu archivo local **no**:

~~~powershell
Copy-Item .env.dev.example .env.dev
notepad .env.dev
~~~

Cambiar `POSTGRES_PASSWORD`, `JWT_SECRET` y `EMAIL_VERIFICATION_SECRET`. Usar contraseñas y secretos **diferentes**; para los dos `*_SECRET` puede generarse un valor aleatorio de al menos 32 caracteres cada uno con Node.js:

~~~powershell
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
~~~

Repetirlo para generar el segundo secreto. Nunca subir el archivo `Docker/.env.dev`, ni enviar secretos en chats o capturas. El `.gitignore` lo excluye del repositorio.

**Correo:** las variables `SMTP_*` son opcionales para las pruebas de módulos que no envían mensajes. Sin un SMTP real, el envío de correos no funcionará; no copiar las credenciales personales de otra persona.

## 4. Levantar los contenedores

Desde `FORJA\Docker`:

~~~powershell
docker compose -p forja-dev --env-file .env.dev -f compose.dev.yml config --quiet
docker compose -p forja-dev --env-file .env.dev -f compose.dev.yml up -d --build
docker compose -p forja-dev --env-file .env.dev -f compose.dev.yml ps
~~~

Abrir **http://localhost:3000**. La primera instalación ejecuta el esquema y catálogos SQL automáticamente **si el directorio de datos de PostgreSQL está vacío**.

## 5. Crear el primer administrador

Una base nueva **no contiene usuarios de ejemplo con contraseñas fijas**. Utilizar el script ya incluido en el backend. Desde la misma ventana PowerShell, dentro de `Docker`:

~~~powershell
$env:ADMIN_USERNAME = "adminlocal"
$env:ADMIN_EMAIL = Read-Host "Correo de prueba autorizado"
$env:ADMIN_PASSWORD = Read-Host "Contraseña nueva (mínimo 12 caracteres)"
docker compose -p forja-dev --env-file .env.dev -f compose.dev.yml exec -T -e ADMIN_USERNAME -e ADMIN_EMAIL -e ADMIN_PASSWORD backend node scripts/bootstrap-admin.mjs
Remove-Item Env:ADMIN_PASSWORD
Remove-Item Env:ADMIN_USERNAME
Remove-Item Env:ADMIN_EMAIL
~~~

La contraseña **se introduce como texto visible** usando `Read-Host`; conviene introducirla en un lugar privado o usar `Read-Host -AsSecureString` y convertirla temporalmente con cuidado. No guardar contraseñas en un archivo versionado ni en comandos de consola compartidos. El script crea **solo el primer administrador**, no usuarios duplicados.

Abrir **http://localhost:3000/login** e iniciar sesión como `adminlocal`. Desde «Gestionar usuarios» crear usuarios ficticios de profesor y monitor. Al crear profesor hay que asignar facultad.

## 6. Pruebas rápidas

Seguir [COMO_PROBAR_MVP.md](COMO_PROBAR_MVP.md). Se puede comprobar:

- Profesor: proyecto nuevo, semestre actual, análisis ético, ODS, zonas, aprobación y evidencias.
- Monitor: digitalización histórica con campos desconocidos; el administrador asigna un profesor para continuar un proyecto activo.
- Comunidad: un enlace privado **por semestre** que abre el formulario institucional de 19 preguntas sin cuenta.
- Administrador: usuarios, catálogo de zonas y Excel con filtros de año de inicio, zona, ODS, departamento, carrera y población externa.

La base del compañero estará inicialmente vacía de **proyectos**, aunque los catálogos académicos se cargan mediante SQL. **No contiene los proyectos creados en otra instalación**.

## 7. Actualizar una instalación existente

Si ya utilizas FORJA y tienes proyectos guardados:

~~~powershell
git pull origin forja/primera-etapa-backend
cd Docker
docker compose -p forja-dev --env-file .env.dev -f compose.dev.yml up -d --build --force-recreate backend frontend
~~~

**Atención:** el código se actualiza, pero los cambios de esquema no. Antes de instalar una nueva versión, consultar [README — Base de datos](../README.md#base-de-datos-y-persistencia) y ejecutar solo las migraciones que falten tras crear un respaldo.

Para respaldar:

~~~powershell
.\forja.ps1 dev backup-db
~~~

**No usar** `reset-db`, `docker compose down -v` ni eliminar `Docker/database/data/dev` para actualizar una instalación que tiene datos.

## 8. Si aparece un error

~~~powershell
docker compose -p forja-dev --env-file .env.dev -f compose.dev.yml logs --tail=100 backend frontend database
~~~

- Si falta `Docker/.env.dev`, crear el archivo desde `.env.dev.example`.
- Si falla JWT al iniciar backend, comprobar `JWT_SECRET` (mínimo 32 caracteres).
- Si PostgreSQL no arranca, revisar `POSTGRES_*`, el estado del contenedor y si los datos pertenecen a una instalación anterior con credenciales diferentes.
- Si una tabla o columna no existe en una base previamente creada, revisar migraciones incrementales. **No borrar la base**.
- Si el puerto está ocupado, modificar el puerto **publicado al PC** correspondiente en `.env.dev`, y actualizar orígenes externos si cambia el frontend.
- La base de datos y los PDF de la instalación se guardan fuera de Git, en `Docker/database/data/dev/` y `Docker/evidence-storage/dev/`.

## 9. Seguridad y trabajo en grupo

No compartir contraseñas, cookies, PDFs, respaldos ni datos personales en repositorios, capturas o chats de grupo. Usar siempre un entorno individual con proyectos ficticios. El repositorio contiene **código y plantillas de configuración**, no los registros del equipo.

Para el diseño y estado de módulos: [README](../README.md), [Especificación](ESPECIFICACION_FUNCIONAL_MVP.md) y [Estado de implementación](ESTADO_IMPLEMENTACION.md).
