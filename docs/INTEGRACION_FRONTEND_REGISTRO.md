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

## Ajustes de interfaz y flujo (23/11/2026)

- **Autorregistro único:** se eliminó del panel de administración el formulario «Crear usuario» y se cerraron tanto `POST /users/create` como `POST /api/users`. Los usuarios se registran desde `/register`, verifican su correo y **solo entonces** el administrador les asigna el rol Profesor (con facultad) o Monitor y los activa; también puede rechazar. El comando especial `scripts/bootstrap-admin.mjs` permanece para crear el **primer administrador** de una instalación nueva.
- **Barra lateral:** `components/navigation/WorkspaceShell.tsx`, con un degradado violeta similar al diseño de `yuracoff18/ForjaWebProject`, menú por rol, área de usuario y salida de sesión.
- **Registro de proyectos:** `components/projects/NewProjectForm.tsx` incorpora checkpoints laterales 01 Información general, 02 Período académico, 03 Ética/ODS, 04 Guardar. Son accesos rápidos a secciones del mismo formulario (no se destruyen campos ni se omiten validaciones), con estado de sección activa, no estados de aprobación. Toda la información se guarda usando el flujo existente.
- **Seguimiento por semestre:** `components/projects/PeriodWorkflow.tsx` muestra las cinco etapas solicitadas: Creación, Aprobación del proyecto (aprobación **del semestre** en la base), Envío de evidencias, Aprobación de evidencias y Cierre semestral. Se calcula a partir de `project_periods.approval_status`, `execution_status` y evidencias PDF reales de ese período. Cambiar de semestre actualiza el seguimiento y las evidencias vuelven a consultarse después de cargas o revisiones.
- **Períodos históricos:** presentan explícitamente «Archivado sin revisión» en lugar de simular aprobaciones que nunca se realizaron.
- **Finalización definitiva:** el estado general del proyecto sigue separado del cierre de cada semestre; el indicador lo comunica sin modificar el backend.
- **Prueba pendiente en navegador:** registro, aprobación, formulario 01–04, creación de un período en borrador, envío, aprobación, subir PDF, aprobación PDF, resultados y cierre; comprobar el estado de cada checkpoint y el cambio entre dos semestres. No se requieren nuevas migraciones para estos ajustes de interfaz posteriores a `20261123_registration_approval.sql`.
