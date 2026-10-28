# FORJA — Guía de Docker (DEV y PROD)

Guía de instalación, levantado, apagado y mantenimiento de los entornos de **FORJA**, desarrollado con **Next.js (frontend), NestJS (backend) y PostgreSQL 17**.

> **Alcance:** `prod` es, por ahora, un **entorno de producción ejecutado localmente**. Compila las aplicaciones y separa sus datos, pero **no publica la aplicación en Internet**. Para publicarla con usuarios reales se necesita configurar dominio, HTTPS, secretos y respaldos externos.

## 1. Requisitos

- **Docker Desktop** iniciado (Windows con WSL2 recomendado), o Docker Engine con Docker Compose v2.
- **PowerShell** (Windows PowerShell 5.1 o PowerShell 7) para usar `forja.ps1`.
- Carpetas `forja_back-end/` y `forja_frontend/` con proyectos funcionales, `package.json` y `package-lock.json`.
- En NestJS, el script `npm run start:dev`; en Next.js, el script `npm run dev`.
- Puertos libres: `3000`, `3001`, `5433` para DEV; `3100`, `3101` para PROD local.

Comprueba la instalación:

```powershell
docker --version
docker compose version
```

## 2. Estructura esperada

```text
FORJA/
├── .gitignore
├── README.md                       # Este documento
├── Docker/
│   ├── forja.ps1                   # Administrador de entornos
│   ├── compose.dev.yml
│   ├── compose.prod.yml
│   ├── .env.dev                    # No subir a Git
│   ├── .env.prod                   # No subir a Git
│   ├── backups/                    # Se crea al hacer backups
│   │   ├── dev/
│   │   └── prod/
│   └── database/
│       ├── Dockerfile
│       ├── init/
│       │   └── 01_init.sql
│       └── data/
│           ├── dev/               # Base DEV persistente
│           └── prod/              # Base PROD persistente
├── forja_back-end/
│   ├── Dockerfile.dev
│   ├── Dockerfile.prod
│   ├── .dockerignore
│   └── ...
└── forja_frontend/
    ├── Dockerfile.dev
    ├── Dockerfile.prod
    ├── .dockerignore
    └── ...
```

Los archivos Compose están en `Docker/`, pero los proyectos fuente están **fuera** de esa carpeta. Por eso, sus contextos de compilación son `../forja_back-end` y `../forja_frontend`.

## 3. Configuración inicial

Crea en `Docker/` los siguientes archivos de entorno, si aún no existen. Usa contraseñas diferentes para cada base de datos y **no guardes claves reales en el repositorio**.

### `Docker/.env.dev`

```dotenv
FRONTEND_PORT=3000
BACKEND_PORT=3001
POSTGRES_PORT=5433
NEXT_PUBLIC_API_URL=http://localhost:3001
CORS_ORIGINS=http://localhost:3000

POSTGRES_USER=devuser
POSTGRES_PASSWORD=CAMBIAR_PASSWORD_DEV
POSTGRES_DB=myapp_dev
```

### `Docker/.env.prod` (prueba local de producción)

```dotenv
FRONTEND_PORT=3100
BACKEND_PORT=3101
NEXT_PUBLIC_API_URL=http://localhost:3101
CORS_ORIGINS=http://localhost:3100

POSTGRES_USER=forja_prod
POSTGRES_PASSWORD=CAMBIAR_POR_PASSWORD_SEGURO_Y_DISTINTO
POSTGRES_DB=forja_prod
```

**Notas:**

- `NEXT_PUBLIC_API_URL` es la URL usada por el **navegador**, no el nombre de contenedor. En PROD real deberá apuntar al dominio público del backend, por ejemplo `https://api.example.com`.
- Desde NestJS, PostgreSQL se conecta usando `database:5432`, **no** `localhost`.
- Desde el servidor Next.js dentro de Docker, NestJS se alcanza en `http://backend:3001` mediante `INTERNAL_API_URL`, siempre que el Compose lo defina.
- Las variables `NEXT_PUBLIC_*` quedan integradas al frontend durante la **compilación**; si cambias la URL pública, reconstruye su imagen.
- Confirma que tu configuración real del ORM o cliente PostgreSQL de NestJS lee las variables `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` y `DB_NAME` que proporciona Compose.

### Archivos que nunca deben subirse a Git

El `.gitignore` de la raíz debe excluir, como mínimo:

```gitignore
/Docker/.env.dev
/Docker/.env.prod
/Docker/database/data/
/Docker/backups/
**/node_modules/
**/.next/
**/dist/
```

Sí se deben versionar `compose.dev.yml`, `compose.prod.yml`, los Dockerfiles, `forja.ps1` y `database/init/01_init.sql`.

## 4. Inicio rápido

Abre PowerShell, entra a `FORJA/Docker/` y ejecuta:

```powershell
cd Docker

# Inicia desarrollo
.\forja.ps1 dev up

# Consulta el estado
.\forja.ps1 dev ps

# Apaga desarrollo sin borrar datos
.\forja.ps1 dev down

# Compila e inicia producción local
.\forja.ps1 prod up

# Apaga producción local sin borrar datos
.\forja.ps1 prod down
```

`up` usa `docker compose up -d --build`: construye/reconstruye imágenes cuando corresponde y deja los servicios ejecutándose en segundo plano. El primer arranque puede tardar más porque descarga imágenes e instala dependencias.

### URLs de cada entorno

| Servicio | DEV | PROD local |
|---|---|---|
| Frontend Next.js | http://localhost:3000 | http://localhost:3100 |
| Backend NestJS | http://localhost:3001 | http://localhost:3101 |
| PostgreSQL desde el PC | `localhost:5433` | No expuesto al PC |
| PostgreSQL dentro de Docker | `database:5432` | `database:5432` |
| Datos en el PC | `Docker/database/data/dev/` | `Docker/database/data/prod/` |

> Las URL raíz del backend pueden devolver 404 si no existe un endpoint `/`; revisa un endpoint real de la API.

## 5. Todos los comandos del administrador

Ejecuta estos comandos desde `Docker/`:

| Comando | Resultado |
|---|---|
| `.\forja.ps1 dev up` | Construye e inicia DEV |
| `.\forja.ps1 dev down` | Detiene y elimina contenedores/red de DEV; conserva datos |
| `.\forja.ps1 dev restart` | Reinicia los contenedores DEV **sin reconstruir imágenes** |
| `.\forja.ps1 dev logs` | Muestra los últimos logs y los sigue en tiempo real (`Ctrl+C` para salir) |
| `.\forja.ps1 dev ps` | Lista contenedores y estado de DEV |
| `.\forja.ps1 dev backup-db` | Crea respaldo PostgreSQL DEV |
| `.\forja.ps1 dev reset-db` | **Borra TODOS los datos DEV**, reinicia e importa `01_init.sql` |
| `.\forja.ps1 prod up` | Construye e inicia PROD local |
| `.\forja.ps1 prod down` | Detiene y elimina contenedores/red de PROD; conserva datos |
| `.\forja.ps1 prod restart` | Reinicia PROD sin reconstrucción |
| `.\forja.ps1 prod logs` | Consulta logs de PROD |
| `.\forja.ps1 prod ps` | Consulta el estado de PROD |
| `.\forja.ps1 prod backup-db` | Crea respaldo PostgreSQL PROD |

`prod reset-db` está **bloqueado** intencionalmente por el administrador `forja.ps1`.

### Comandos directos de Docker Compose (sin script)

Si no puedes usar `forja.ps1`, entra a `FORJA/Docker/` y ejecuta:

```powershell
# DEV: levantar / apagar
docker compose -p forja-dev --env-file .env.dev -f compose.dev.yml up -d --build
docker compose -p forja-dev --env-file .env.dev -f compose.dev.yml down

# PROD: levantar / apagar
docker compose -p forja-prod --env-file .env.prod -f compose.prod.yml up -d --build
docker compose -p forja-prod --env-file .env.prod -f compose.prod.yml down
```

Para validar un archivo Compose sin iniciar servicios:

```powershell
docker compose -p forja-dev --env-file .env.dev -f compose.dev.yml config --quiet
docker compose -p forja-prod --env-file .env.prod -f compose.prod.yml config --quiet
```

## 6. Trabajo diario en DEV

1. Enciende Docker Desktop.
2. Ejecuta `.\forja.ps1 dev up`.
3. Edita archivos dentro de `forja_frontend/` o `forja_back-end/`.
4. Next.js y NestJS detectarán cambios mediante los volúmenes de desarrollo y sus comandos `dev`/`start:dev`. Si en Windows los cambios no se detectan, revisa WSL2 y el observador de archivos.
5. Revisa logs con `.\forja.ps1 dev logs`.
6. Al terminar, usa `.\forja.ps1 dev down`.

**Código vs. dependencias:** cambios normales en `.tsx` y `.ts` no requieren crear otra imagen. Si modificas `package.json`/`package-lock.json`, reconstruye las imágenes y renueva los volúmenes anónimos de dependencias si es necesario:

```powershell
docker compose -p forja-dev --env-file .env.dev -f compose.dev.yml up -d --build -V
```

La opción `-V` renueva los volúmenes anónimos (como `/app/node_modules`) al recrear contenedores. **No borra** el directorio bind-mount `database/data/dev/`.

## 7. Base de datos y archivo `01_init.sql`

El archivo `Docker/database/init/01_init.sql` define el esquema inicial y se copia a `/docker-entrypoint-initdb.d/` por el `Docker/database/Dockerfile`:

```dockerfile
FROM postgres:17-alpine
COPY ./init/ /docker-entrypoint-initdb.d/
EXPOSE 5432
```

**Importante:** PostgreSQL ejecuta este SQL **solo en la primera inicialización de un directorio de datos vacío**. Modificar el SQL y ejecutar `up` **no** actualiza tablas ya creadas.

### Recrear la base DEV después de editar el SQL

```powershell
.\forja.ps1 dev reset-db
```

Confirma escribiendo exactamente `BORRAR-DEV`. El script:

1. Apaga los servicios DEV.
2. Elimina **únicamente** `Docker/database/data/dev/`.
3. Recrea el directorio vacío.
4. Reconstruye e inicia DEV; PostgreSQL inicializa la base y ejecuta `01_init.sql`.

> **PELIGRO — BORRADO IRREVERSIBLE:** todos los usuarios, proyectos y demás registros DEV desaparecen. Si necesitas esos datos, ejecuta antes `.\forja.ps1 dev backup-db`.

**Nunca** borres `Docker/database/data/prod/` para aplicar cambios al esquema cuando contenga datos reales. Para producción, planifica un procedimiento SQL de actualización, toma un respaldo y prueba el cambio antes.

### Consultar tablas desde el contenedor DEV

Desde `Docker/`:

```powershell
docker compose -p forja-dev --env-file .env.dev -f compose.dev.yml exec database sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"'
```

Dentro de `psql`:

```sql
\dt
SELECT current_database();
\q
```

También puedes conectarte desde DBeaver o pgAdmin usando `localhost`, puerto `5433` y las credenciales de `.env.dev`.

## 8. Respaldos de PostgreSQL

Con el entorno correspondiente **encendido**:

```powershell
.\forja.ps1 dev backup-db
.\forja.ps1 prod backup-db
```

Los archivos se guardan en:

```text
Docker/backups/dev/forja-dev-AAAAMMDD-HHMMSS-ms.dump
Docker/backups/prod/forja-prod-AAAAMMDD-HHMMSS-ms.dump
```

El administrador utiliza `pg_dump -Fc` dentro del contenedor y después copia el respaldo al PC. El formato `.dump` es compatible con `pg_restore`. **El script no incluye un comando automático de restauración**: una restauración debe planificarse y probarse por separado.

Para datos reales, además de los respaldos locales:

- Conserva copias en un destino externo, seguro y con acceso restringido.
- Prueba periódicamente que un respaldo puede restaurarse.
- Haz respaldo **antes** de cambiar la estructura de una base de producción.

## 9. Cómo actualizar PROD

Para desplegar cambios de aplicación en tu instancia de producción local:

```powershell
.\forja.ps1 prod backup-db
.\forja.ps1 prod up
.\forja.ps1 prod ps
.\forja.ps1 prod logs
```

`up` vuelve a compilar los proyectos y recrea los contenedores necesarios, pero **no borra los registros** persistentes de `database/data/prod/`.

**Si modificas `01_init.sql`, esos cambios NO se aplican a la base PROD existente.** No elimines su directorio de datos para forzar la ejecución del script. Debes actualizar el esquema con SQL planificado o migraciones cuando tengas registros reales.

### Antes de publicar FORJA en Internet

La configuración PROD descrita aquí está limitada a pruebas locales (`127.0.0.1:3100` y `127.0.0.1:3101`). Antes de anunciar un lanzamiento real, configura:

- Dominio y proxy inverso HTTPS (por ejemplo, Caddy o Nginx).
- URL pública real del backend en `NEXT_PUBLIC_API_URL` y origen HTTPS del frontend en `CORS_ORIGINS`.
- Reconstrucción del frontend después de cambiar `NEXT_PUBLIC_API_URL`.
- Secretos y permisos seguros; PostgreSQL sin puerto público.
- Copias externas, observabilidad, plan de recuperación y actualización segura del esquema.

**No interpretes `.\forja.ps1 prod up` como garantía de que ya está lista la aplicación para usuarios públicos.**

## 10. Solución de problemas frecuentes

| Problema | Posible solución |
|---|---|
| `docker` no se reconoce | Instala/abre Docker Desktop y comprueba `docker --version` |
| PowerShell bloquea `forja.ps1` | Revisa el script; usa `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` si la política de tu equipo lo permite |
| `npm ci` falla | Confirma que cada proyecto tenga `package-lock.json` actualizado y compatible con `package.json` |
| Error de puerto ocupado | Revisa quién usa `3000`, `3001`, `5433`, `3100` o `3101`; ajusta los puertos en el `.env` correspondiente |
| Next.js no detecta cambios | Comprueba los montajes de DEV y, en Windows, considera ejecutar el proyecto dentro de WSL2 |
| NestJS no conecta a PostgreSQL | Usa `DB_HOST=database` y `DB_PORT=5432` dentro de Docker; revisa también la configuración del ORM |
| `01_init.sql` no se ejecuta al reiniciar | Es normal si la base ya existe; para DEV usa `reset-db` después de hacer respaldo |
| `reset-db` muestra error de permisos | No borres archivos mientras PostgreSQL esté ejecutándose; revisa permisos de la carpeta compartida o de WSL2 |
| El backend responde 404 en `/` | Comprueba un endpoint real de NestJS; quizás no tengas definida una ruta raíz |
| Frontend no conecta con backend | Desde navegador usa `localhost:3001` en DEV; entre contenedores usa `backend:3001`. Comprueba CORS |
| El respaldo no se genera | Confirma que `database` esté en funcionamiento y consulta los logs de PostgreSQL |

### Consultar logs de un servicio específico

```powershell
# DEV: solo backend
docker compose -p forja-dev --env-file .env.dev -f compose.dev.yml logs -f backend

# DEV: solo base de datos
docker compose -p forja-dev --env-file .env.dev -f compose.dev.yml logs -f database

# PROD: solo frontend
docker compose -p forja-prod --env-file .env.prod -f compose.prod.yml logs -f frontend
```

## 11. Checklist de verificación

- [ ] Docker está iniciado.
- [ ] `Docker/.env.dev` y `Docker/.env.prod` existen y tienen claves diferentes.
- [ ] Los archivos Compose apuntan a `../forja_back-end` y `../forja_frontend`.
- [ ] Las imágenes DEV y PROD se construyen sin errores.
- [ ] DEV abre en `http://localhost:3000` y su API responde en `http://localhost:3001`.
- [ ] PROD local abre en `http://localhost:3100` y su API responde en `http://localhost:3101`.
- [ ] `database/data/dev/` y `database/data/prod/` son carpetas distintas.
- [ ] `01_init.sql` crea las tablas en bases nuevas.
- [ ] `dev down`/`prod down` conservan los datos.
- [ ] `dev reset-db` recrea únicamente DEV.
- [ ] `backup-db` genera un archivo `.dump` no vacío.

## 12. Referencias oficiales

- [Docker Compose — línea de comandos](https://docs.docker.com/reference/cli/docker/compose/)
- [Docker Compose — nombre del proyecto](https://docs.docker.com/compose/how-tos/project-name/)
- [PostgreSQL en Docker — inicialización y persistencia](https://docs.docker.com/guides/postgresql/)
- [Docker Compose — copiar archivos con `cp`](https://docs.docker.com/reference/cli/docker/compose/cp/)

---

**Proyecto FORJA.** El script `forja.ps1` y los Compose descritos deben estar presentes y configurados como se indica. La guía documenta el comportamiento esperado; la ejecución real debe comprobarse en el equipo de desarrollo antes de operar con datos de producción.
