# FORJA — Rama experimental de integración visual y autorregistro

**Repositorio de integración:** `iarangou/FORJA`, rama `forja/integracion-frontend`.

**Referencia del diseño y del registro con código:** `yuracoff18/ForjaWebProject` (`main`, revisado el 23 de noviembre de 2026).

**Rama de referencia:** `main` de `iarangou/FORJA`, fusionada desde `forja/primera-etapa-backend` por el PR #1. La integración experimental **no se fusiona automáticamente** en `main`.

## Qué se integra

- Navegación lateral, cabecera con usuario y enlaces diferenciados por rol en `/home`, `/proyectos` y `/administracion`. Se conserva la implementación de proyectos, períodos, evidencia, carta firmada, evaluación comunitaria y Excel.
- Registro público solo con correo institucional `@javerianacali.edu.co`, nombre y contraseña. El usuario **no puede autoasignarse profesor, monitor ni administrador**.
- Código numérico de seis dígitos, vence tras 10 minutos; Redis mantiene el registro provisional y límites de reintentos/reenvío. El código se guarda en Redis como hash HMAC.
- Tras verificar correo se crea cuenta `is_active=FALSE`, `registration_status='PENDING'`. Aunque `rol_id` tiene valor 3 por defecto debido a la estructura previa, es **provisional**: el backend no permite sesiones para cuentas pendientes.
- Solo el administrador revisa en `/administracion/usuarios` y selecciona expresamente **Profesor** (requiere facultad) o **Monitor**; decide `APPROVE` o `REJECT`. La aprobación asigna el rol y activa la cuenta en una transacción.
- Las cuentas anteriores conservan `registration_status='APPROVED'` y permisos existentes mediante una migración aditiva.

## Primera actualización de una base existente

**Respaldar** antes de aplicar modificaciones. Desde la raíz:

```powershell
git fetch origin
git switch forja/integracion-frontend
cd Docker
.\forja.ps1 dev backup-db
Get-Content -Raw .\database\migrations\20261123_registration_approval.sql | docker compose -p forja-dev --env-file .env.dev -f compose.dev.yml exec -T database sh -c 'psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB"'
docker compose -p forja-dev --env-file .env.dev -f compose.dev.yml up -d --build --force-recreate backend frontend
```

Las instalaciones **nuevas** toman `registration_status` de `Docker/database/init/zzz_forja_forms_and_reviews.sql`, pero las instalaciones existentes requieren migración explícita.

**Importante:** `VERIFICATION_LOG_CODES=true` con `NODE_ENV=development` habilita códigos en los **logs del backend solamente para probar en local**. No es un correo enviado. Para enviar realmente códigos por correo, poner `VERIFICATION_LOG_CODES=false` y configurar SMTP válido (`SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`).

Nunca dejar códigos en logs de producción, ni subir `.env.dev`. En producción también deben implementarse controles más amplios contra abusos y revisar privacidad.

## Pruebas sugeridas

1. Abrir `http://localhost:3000/register`; registrar una cuenta ficticia `@javerianacali.edu.co` y usar el código recibido (por SMTP o por logs DEV explícitos).
2. Verificar el correo. Intentar iniciar sesión: **debe rechazarse** hasta que el admin apruebe.
3. Como administrador, ir a «Usuarios y solicitudes»: elegir **Monitor** y aprobar. Comprobar que puede entrar y usar digitalización histórica, no aprobar semestres.
4. Repetir con cuenta nueva, elegir **Profesor** y facultad; aprobar. Comprobar creación de proyecto y sus períodos.
5. Intentar registrar un correo que no sea institucional, introducir código incorrecto, reenviar demasiado pronto, y reutilizar uno ya usado: deben bloquearse.
6. Rechazar una solicitud: debe quedar inactiva sin poder iniciar sesión.
7. Comprobar que los usuarios existentes mantienen acceso y que los proyectos, períodos, cartas, evaluaciones y Excel continúan funcionando.

## Pendiente

- Probar extremo a extremo con PostgreSQL, Redis, SMTP real y navegador; GitHub Actions comprueba compilación pero **no entrega correos ni simula aprobaciones completas**.
- Integrar más componentes visuales del equipo, especialmente la presentación de fichas y formulario por pasos, adaptándolos a los datos semestrales reales.
- Definir política institucional de registro y tratamiento de datos, notificaciones de aprobación/rechazo y recuperación de contraseña.
