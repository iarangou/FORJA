# FORJA — Cómo probar la rama MVP en Windows

**Rama:** `forja/primera-etapa-backend` (Pull Request #1).  
**Estado:** prototipo en desarrollo, **no es producción**. No ejecutar scripts sobre una base con información real sin respaldo y migración revisada.

## 1. Actualizar tu copia local

Si ya clonaste el repositorio propio en tu PC:

```powershell
git fetch origin
git switch forja/primera-etapa-backend
```

O clonar directamente la rama nueva:

```powershell
git clone --branch forja/primera-etapa-backend https://github.com/iarangou/FORJA.git
cd FORJA
```

## 2. Preparar variables DEV

Crea `Docker/.env.dev` con variables de prueba **sin subirlas a Git**:

```dotenv
FRONTEND_PORT=3000
BACKEND_PORT=3001
POSTGRES_PORT=5433
NEXT_PUBLIC_API_URL=http://localhost:3001
CORS_ORIGINS=http://localhost:3000
POSTGRES_USER=forja_dev
POSTGRES_PASSWORD=CAMBIA_ESTA_CLAVE_LOCALMENTE
POSTGRES_DB=forja_dev
JWT_SECRET=GENERA_UN_SECRETO_ALEATORIO_DE_32_CARACTERES_O_MAS
JWT_EXPIRES_IN_SECONDS=7200
EMAIL_VERIFICATION_SECRET=NO_USADO_TRAS_DESACTIVAR_REGISTRO
VERIFICATION_LOG_CODES=false
SMTP_HOST=
SMTP_PORT=
SMTP_SECURE=false
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=
```

Para generar `JWT_SECRET` desde PowerShell (requiere Node):

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

**No compartas contraseñas o archivos .env en el chat, por correo o mediante commits.**

## 3. Iniciar el entorno local

Abre Docker Desktop y luego, en PowerShell:

```powershell
cd Docker
.\forja.ps1 dev up
.\forja.ps1 dev ps
```

Deberías tener frontend en `http://localhost:3000` y backend en `http://localhost:3001`.

PostgreSQL ejecuta `create_tables.sql`, `insert_values.sql` y las migraciones con prefijo `zz` **solo al inicializar un volumen vacío**. Si ya existe `Docker/database/data/dev`, los SQL nuevos no se aplican por `up`. **Respaldar primero** y planificar migración; `dev reset-db` borra todos los datos DEV.

## 4. Crear el primer administrador sin contraseña conocida

Ya no se crean automáticamente cuentas con la contraseña `12345678` del código antiguo.

Con los contenedores funcionando, desde la carpeta `Docker` abre un shell en el backend:

```powershell
docker compose -p forja-dev --env-file .env.dev -f compose.dev.yml exec backend bash
```

Dentro de Bash:

```bash
export ADMIN_USERNAME=admin
export ADMIN_EMAIL=admin@javerianacali.edu.co
read -rs -p "Contraseña nueva (mínimo 12 caracteres): " ADMIN_PASSWORD
echo
export ADMIN_PASSWORD
npm run bootstrap:admin
unset ADMIN_PASSWORD
exit
```

Usa un correo autorizado para el entorno de prueba. La contraseña se introduce sin imprimirse y **no se guarda en el repositorio**.

## 5. Probar en el navegador

1. Abre `http://localhost:3000/login`, inicia sesión con el administrador.
2. Al ingresar, verás `/proyectos`: listado de proyectos.
3. En `/proyectos/nuevo`, crea un borrador y un período. El formulario de análisis ético se aplica a registros actuales.
4. Para comprobar el flujo del profesor, crea primero un usuario con rol 3 mediante `POST /users/create` como administrador (aún falta interfaz de gestión de usuarios). Debe tener una facultad válida. No uses datos de personas reales para pruebas.
5. Completa los campos requeridos y solicita revisión. Si falta algo, la API indicará qué se debe completar. El panel del administrador permite aprobar o devolver un período en revisión.

**Limitaciones conocidas del MVP:**
- No hay aún editor de borradores guardados, carga binaria de evidencias, reporte Excel ni formulario comunitario desplegado.
- Los permisos/avales que se requieran **bloquean el envío** si no se han adjuntado; el sistema de archivos seguro está pendiente.
- Las asignaturas deben ser creadas por el administrador usando `POST /course/create` o una interfaz futura. No se suministran asignaturas ficticias como catálogo oficial.
- El administrador aún no puede gestionar usuarios en interfaz gráfica; existe backend.
- El cambio de contraseña temporal al primer inicio, la recuperación de contraseña y controles de despliegue requieren implementación.
- La declaración de ética y los documentos finales se consideran supuestos funcionales, no aval institucional.
- CI verifica compilación de código al estar habilitadas las acciones GitHub; no sustituye pruebas de PostgreSQL/seguridad.
