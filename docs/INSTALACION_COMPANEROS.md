# FORJA - Instalación local para otro compañero

La rama que estamos probando es `forja/primera-etapa-backend`.
Se recomienda usar **datos de prueba propios**, no copiar la base de datos ni archivos privados de otra persona.

## Requisitos
- Git, Docker Desktop y PowerShell.
- Puertos 3000, 3001, 5433 y 8080 libres.

## Primera instalación (PowerShell)
```powershell
git clone -b forja/primera-etapa-backend https://github.com/iarangou/FORJA.git
cd FORJA/Docker
Copy-Item .env.dev.example .env.dev
notepad .env.dev
```

Cambiar `POSTGRES_PASSWORD`, `JWT_SECRET` y `EMAIL_VERIFICATION_SECRET` por secretos locales y diferentes. Nunca compartir `.env.dev` ni subirlo a Git.

Se pueden generar dos secretos aleatorios desde PowerShell:
```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Reemplazar las dos variables `*_SECRET` con las cadenas obtenidas; cambiar `POSTGRES_PASSWORD` por una contraseña privada distinta.
Para pruebas sin servicio SMTP, mantener las variables SMTP vacías; las funciones que requieran enviar correo pueden no funcionar.

```powershell
docker compose -p forja-dev --env-file .env.dev -f compose.dev.yml config --quiet
docker compose -p forja-dev --env-file .env.dev -f compose.dev.yml up -d --build
docker compose -p forja-dev --env-file .env.dev -f compose.dev.yml ps
```

Abrir http://localhost:3000.

## Primera cuenta de administrador

La base nueva no trae usuarios ni contraseñas de demostración. Para configurar una cuenta propia, ejecutar el script que ya incluye el repositorio:

```powershell
$env:ADMIN_USERNAME = 'adminlocal'
$env:ADMIN_EMAIL = 'adminlocal@javerianacali.edu.co'
$env:ADMIN_PASSWORD = Read-Host 'Contraseña de administrador (mínimo 12 caracteres)'
docker compose -p forja-dev --env-file .env.dev -f compose.dev.yml exec -T -e ADMIN_USERNAME -e ADMIN_EMAIL -e ADMIN_PASSWORD backend node scripts/bootstrap-admin.mjs
Remove-Item Env:ADMIN_PASSWORD
```

**Importante:** ejecutar este bloque en la misma sesión PowerShell. El correo mostrado es un ejemplo: usar el correo personal de prueba, sin asumir que recibirá correos. El script solo crea un administrador si aún no existe otro.

Después, iniciar sesión con el usuario y contraseña creados, y crear usuarios de prueba desde **Gestionar usuarios** si se requieren roles profesor o monitor.

## Si no levanta
```powershell
docker compose -p forja-dev --env-file .env.dev -f compose.dev.yml logs --tail=100 backend frontend database
```

- No copiar `Docker/database/data/dev`, `Docker/evidence-storage/dev` ni respaldos de la cuenta de otra persona.
- No utilizar `reset-db` ni `down -v` en una instalación con datos que se quieran conservar.
- Si otra aplicación ocupa los puertos, cambiarlos en `.env.dev`, excepto el puerto interno 3001 del servicio.
