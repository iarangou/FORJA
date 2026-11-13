# Endpoints de FORJA

## Roles

| ID | Rol | Permisos en estos módulos |
| --- | --- | --- |
| 1 | `admin` — Administrador | Administra usuarios, edita su perfil y consulta facultades y programas. |
| 2 | `evaluator` — Evaluador | Consulta y edita su perfil, y consulta facultades y programas. |
| 3 | `teacher` — Profesor | Consulta y edita su perfil y facultad, y consulta facultades y programas. |

## Flujo de registro

1. Envía los datos a `POST /auth/register`. Se envía un código al correo.
2. Confirma el código en `POST /auth/verify-email`. Se crea la cuenta como profesor, pendiente de aprobación.
3. El administrador activa la cuenta desde `POST /users/update` con el `id` del usuario e `is_active: true`.
4. Inicia sesión en `POST /auth/login` para obtener el token.

## Cuenta del administrador

Para iniciar sesión como administrador, envía estos datos a `POST /auth/login`:

```json
{
  "username": "admin",
  "password": "12345678"
}
```

## Cómo enviar las peticiones

Los datos se envían en el cuerpo como JSON. Usa estos encabezados:

```http
Content-Type: application/json
Authorization: Bearer <access_token>
```

El token se obtiene al iniciar sesión. Las rutas de **auth** y `GET /faculty` son públicas; las demás necesitan el token de una cuenta activa. Las consultas `GET` no llevan cuerpo.

Las respuestas correctas usan `200` para `GET` y `PATCH`, y `201` para `POST`. Los datos de los ejemplos son ilustrativos.

## Auth

### POST `/auth/register`

Inicia el registro y envía un código al correo. La cuenta se crea al verificarlo.

**Recibe:**

```json
{
  "email": "ana@javerianacali.edu.co",
  "full_name": "Ana Pérez",
  "password": "una-clave-segura",
  "faculty_id": 2
}
```

El `username` se genera con la parte del correo anterior a `@`: en este caso, `ana`.

**Devuelve:**

```json
{
  "message": "Registro pendiente. Introduce el código de verificación",
  "expires_in": 600
}
```

El código llega por correo y dura 10 minutos. `expires_in` se expresa en segundos.

### POST `/auth/verify-email`

Verifica el código y crea la cuenta como profesor, con la facultad elegida. Queda pendiente de aprobación del administrador.

**Recibe:**

```json
{
  "email": "ana@javerianacali.edu.co",
  "code": "012345"
}
```

**Devuelve:**

```json
{
  "message": "Correo verificado. Cuenta creada y pendiente de aprobación del administrador"
}
```

El administrador activa la cuenta desde `/users/update` con `is_active: true`.

### POST `/auth/resend-verification`

Envía un nuevo código para un registro pendiente y reemplaza el anterior.

**Recibe:**

```json
{
  "email": "ana@javerianacali.edu.co"
}
```

**Devuelve:**

```json
{
  "message": "Se generó un nuevo código de verificación",
  "expires_in": 600
}
```

### POST `/auth/login`

Inicia sesión con el nombre de usuario y la contraseña.

**Recibe:**

```json
{
  "username": "ana",
  "password": "una-clave-segura"
}
```

**Devuelve:**

```json
{
  "access_token": "<token>",
  "user": {
    "id": 7,
    "username": "ana",
    "rol": 3
  }
}
```

Usa `access_token` en el encabezado `Authorization` de las siguientes peticiones. Aquí `rol` es el ID del rol.

## Users

### GET `/users`

**Acceso:** administrador. Devuelve la lista de usuarios. No recibe cuerpo.

**Devuelve:**

```json
[
  {
    "id": 7,
    "username": "ana",
    "email": "ana@javerianacali.edu.co",
    "full_name": "Ana Pérez",
    "rol_id": 3,
    "rol": "teacher",
    "is_active": true,
    "last_login_at": null,
    "created_at": "2026-11-12T14:00:00.000Z",
    "updated_at": "2026-11-12T14:00:00.000Z"
  }
]
```

`rol_id` es el ID del rol y `rol` es su nombre. `last_login_at` indica el último inicio de sesión; puede ser `null`.

### GET `/users/:id`

**Acceso:** administrador. Consulta un usuario con el ID de la ruta, por ejemplo: `/users/7`. No recibe cuerpo.

**Devuelve:** un objeto con los mismos campos del usuario mostrado en `GET /users`, sin el arreglo exterior.

### GET `/users/me`

**Acceso:** cualquier rol. Consulta el perfil de quien envía el token. No recibe cuerpo ni ID.

**Devuelve:**

```json
{
  "id": 7,
  "username": "ana",
  "full_name": "Ana Pérez",
  "email": "ana@javerianacali.edu.co",
  "rol_id": 3,
  "faculty_id": 2,
  "faculty_name": "Ingeniería y Ciencias"
}
```

Los datos de facultad pueden ser `null` cuando no hay una facultad asociada al perfil.

### PATCH `/users/me`

**Acceso:** cualquier rol. Actualiza el nombre propio y, para profesores, su facultad. Envía los campos que quieras cambiar.

**Recibe:**

```json
{
  "full_name": "Ana María Pérez",
  "faculty_id": 2
}
```

**Devuelve:**

```json
{
  "message": "Perfil actualizado exitosamente.",
  "user": {
    "id": 7,
    "username": "ana",
    "full_name": "Ana María Pérez",
    "email": "ana@javerianacali.edu.co",
    "rol_id": 3,
    "faculty_id": 2,
    "faculty_name": "Ingeniería y Ciencias"
  }
}
```

### POST `/users/create`

**Acceso:** administrador. Crea una cuenta directamente, sin verificación por correo. `faculty_id` se envía al crear profesores; para los otros roles se omite.

**Recibe:**

```json
{
  "email": "ana@javerianacali.edu.co",
  "full_name": "Ana Pérez",
  "password": "una-clave-segura",
  "rol_id": 3,
  "is_active": true,
  "faculty_id": 2
}
```

**Devuelve:**

```json
{
  "message": "Usuario creado exitosamente.",
  "user": {
    "id": 7,
    "username": "ana",
    "email": "ana@javerianacali.edu.co",
    "full_name": "Ana Pérez",
    "rol_id": 3,
    "is_active": true,
    "created_at": "2026-11-12T14:00:00.000Z",
    "updated_at": "2026-11-12T14:00:00.000Z"
  }
}
```

### POST `/users/update`

**Acceso:** administrador. Actualiza un usuario. Envía su `id` y los campos que quieras cambiar: `full_name`, `rol_id`, `is_active` o `faculty_id` (para profesores).

**Recibe, por ejemplo, para aprobar una cuenta:**

```json
{
  "id": 7,
  "is_active": true
}
```

**Devuelve:**

```json
{
  "message": "Usuario actualizado exitosamente.",
  "user": {
    "id": 7,
    "username": "ana",
    "email": "ana@javerianacali.edu.co",
    "full_name": "Ana Pérez",
    "rol_id": 3,
    "is_active": true,
    "last_login_at": null,
    "created_at": "2026-11-12T14:00:00.000Z",
    "updated_at": "2026-11-12T15:00:00.000Z"
  }
}
```

Con `is_active: false` se desactiva la cuenta. Los campos omitidos conservan su valor.

### POST `/users/delete`

**Acceso:** administrador. Elimina el usuario indicado.

**Recibe:**

```json
{
  "id": 7
}
```

**Devuelve:**

```json
{
  "message": "Usuario eliminado exitosamente."
}
```

## Faculty

### GET `/faculty`

**Acceso:** público, sin token. Consulta las facultades para elegir una durante el registro. No recibe cuerpo.

**Devuelve:**

```json
[
  {
    "id": 2,
    "name": "Ingeniería y Ciencias",
    "code": "FIC"
  }
]
```

La ruta del módulo `faculty` es `/faculty`. Actualmente solo está habilitada la consulta.

## Academic programs

### GET `/academic-programs`

**Acceso:** administrador, evaluador o profesor. Consulta los programas académicos junto con el nombre de su facultad. No recibe cuerpo.

**Devuelve:**

```json
[
  {
    "id": 9,
    "name": "Ingeniería de Sistemas y Computación",
    "snies_code": "1042",
    "faculty_name": "Ingeniería y Ciencias"
  }
]
```

La ruta del módulo `academic_programs` es `/academic-programs`. Actualmente solo está habilitada la consulta.
