# Endpoints de FORJA

## Roles y alcance de permisos

Los IDs siguientes corresponden a la carga inicial de roles en una base nueva. Los permisos descritos corresponden a los endpoints del commit documentado.

| ID | Rol | Significado | Permisos actuales |
| --- | --- | --- | --- |
| 1 | `admin` — Administrador | Perfil de administración de la plataforma. | Puede acceder a todos los endpoints protegidos documentados: crear cursos; crear, actualizar y eliminar facultades; y consultar `/test`. Las limitaciones actuales de actualizar y eliminar facultades se detallan en sus endpoints. |
| 2 | `evaluator` — Evaluador | Perfil destinado a la evaluación de proyectos. | Todavía no tiene endpoints propios ni permisos de evaluación implementados. No puede acceder a los endpoints protegidos documentados. |
| 3 | `teacher` — Docente | Perfil docente, asignado por defecto al registrar una cuenta. | Todavía no tiene endpoints propios ni permisos de gestión de proyectos implementados. No puede acceder a los endpoints protegidos documentados. |

Registro e inicio de sesión son públicos. Cualquier cuenta puede iniciar sesión si está activa y presenta credenciales válidas. Los roles no implican una jerarquía automática: los permisos futuros de evaluadores y docentes deben definirse al implementar sus endpoints.


## 1. POST /auth/register

**Explicación:** registra una cuenta con username generado a partir de la parte anterior a `@` del correo, convertida a minúsculas. Guarda la contraseña con bcrypt. No inicia sesión ni entrega JWT.

**Recibe — cuerpo JSON:**

```json
{
  "email": "ana@javerianacali.edu.co",
  "full_name": "Ana Pérez",
  "password": "una-clave-segura"
}
```

| Campo | Tipo | Restricciones |
| --- | --- | --- |
| `email` | string | Obligatorio; correo válido con dominio permitido `javerianacali.edu.co`. |
| `full_name` | string | Obligatorio, no vacío. |
| `password` | string | Obligatorio, mínimo 8 caracteres. |

**Retorna — HTTP 201:**

```json
{
  "message": "User registered successfully"
}
```

**Restricciones y errores:**

- Público: no requiere token.
- No recibe username, ID de rol ni estado de activación.
- Según el esquema, el rol predeterminado es `3` y `active` queda en `false` (por temas de testeo estara en true, pero tendra que hacerse la respetiva verificacion que se hablara despues :). La cuenta no podrá iniciar sesión hasta activarse. No existe en estos controladores un endpoint de activación o verificación por correo.
- HTTP 400 si falla el DTO o se incluyen campos adicionales. El mensaje específico del validador de correo es `Email must be a valid javerianacali.edu.co email address`.
- HTTP 409 con `El correo electrónico ya está registrado` si la consulta previa encuentra exactamente el correo recibido.
- La comprobación de correo en el servicio es sensible a mayúsculas/minúsculas y no normaliza el email. La generación del username sí lo convierte a minúsculas.
- PostgreSQL exige email y username únicos. Una colisión de username generado o una carrera entre registros puede producir HTTP 500 porque el INSERT no captura esas violaciones.
- Límites de base de datos: email 254 caracteres, nombre completo 180 y username generado 80. No tienen validadores de longitud máxima en el DTO; si se superan pueden producir HTTP 500.

## 2. POST /auth/login

**Explicación:** autentica una cuenta activa, actualiza `last_login_at` y entrega un JWT con `sub`, `username` y `rol_id`.

**Recibe — cuerpo JSON:**

```json
{
  "username": "ana",
  "password": "una-clave-segura"
}
```

| Campo | Tipo | Restricciones |
| --- | --- | --- |
| `username` | string | Obligatorio, no vacío; se compara exactamente con `users.username`. |
| `password` | string | Obligatorio, no vacío. No hay longitud mínima de login en el DTO. |

**Retorna — HTTP 201:**

```json
{
  "access_token": "<jwt-firmado>",
  "user": {
    "id": "7",
    "username": "ana",
    "rol": 3
  }
}
```

El ejemplo muestra `id` como string porque `users.id` es BIGINT y el servicio usa el parser predeterminado de `pg`. Su anotación TypeScript como `number` no convierte el valor en ejecución. `rol` en la respuesta es numérico; el mismo dato se llama `rol_id` dentro del JWT. No se devuelve el hash de contraseña.

**Restricciones y errores:**

- Público: no requiere token previo.
- En este commit solo admite username. No busca por correo, aunque exista una propuesta local de login por correo fuera del commit documentado.
- HTTP 400 si el cuerpo no cumple el DTO o contiene campos extra.
- HTTP 401 con `Credenciales inválidas` si el username no existe o la contraseña es incorrecta.
- HTTP 401 con `Usuario inactivo` si la cuenta existe y tiene `active = false`. Esta comprobación ocurre antes de verificar la contraseña.
- Requiere configuración JWT válida y conectividad con PostgreSQL.

## 3. POST /course/create

**Explicación:** crea un curso en la tabla `course`.

**Recibe — headers:**

```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Recibe — cuerpo JSON:**

```json
{
  "name": "Programación I"
}
```

`name`: string obligatorio y no vacío.

**Retorna — HTTP 201:**

```json
{
  "message": "Course created successfully"
}
```

**Restricciones y errores:**

- JWT válido y rol ID `1`. Aplican los HTTP 401/403 descritos al inicio.
- HTTP 400 por cuerpo inválido o campos extra.
- HTTP 409 con `El curso ya existe` al violarse la restricción `course_name_key`.
- El nombre es único y admite hasta 180 caracteres en PostgreSQL. El DTO no valida esa longitud máxima.
- No se normalizan mayúsculas ni espacios; la restricción definida no implementa unicidad ignorando mayúsculas.
- No devuelve el ID ni el registro creado. Otros errores SQL no se traducen y pueden producir HTTP 500.

## 4. POST /faculty/create

**Explicación:** crea una facultad en la tabla `faculty`.

**Recibe — headers:** `Authorization: Bearer <access_token>` y `Content-Type: application/json`.

**Recibe — cuerpo JSON:**

```json
{
  "name": "Facultad de Ingeniería"
}
```

`name`: string obligatorio y no vacío.

**Retorna — HTTP 201:**

```json
{
  "message": "Facultad creada exitosamente"
}
```

**Restricciones y errores:**

- JWT válido y rol ID `1`. Aplican los HTTP 401/403 generales.
- HTTP 400 por cuerpo inválido o campos extra.
- HTTP 409 con `La facultad ya existe` al violarse `faculty_name_key`.
- Nombre único, máximo 180 caracteres en PostgreSQL, sin validación de longitud máxima en el DTO ni normalización de espacios/mayúsculas.
- No devuelve el ID ni el registro creado. Otros errores SQL pueden producir HTTP 500.

## 5. POST /faculty/update

**Explicación:** ejecuta la actualización del nombre de una facultad por ID. Actualmente su respuesta tiene un defecto: el servicio consulta `rows[0]` después de un UPDATE sin `RETURNING`.

**Recibe — headers:** `Authorization: Bearer <access_token>` y `Content-Type: application/json`.

**Recibe — cuerpo JSON:**

```json
{
  "id": 1,
  "name": "Facultad de Ciencias"
}
```

| Campo | Tipo | Restricciones |
| --- | --- | --- |
| `id` | number | Obligatorio; enviar número JSON, no string. |
| `name` | string | Obligatorio, no vacío. |

**Retorna actualmente — HTTP 404 si el UPDATE termina sin error SQL:**

```json
{
  "message": "Faculty not found",
  "error": "Not Found",
  "statusCode": 404
}
```

**Restricciones y comportamiento actual:**

- JWT válido y rol ID `1`. Aplican HTTP 401/403 generales y HTTP 400 por DTO inválido.
- El nombre sigue sujeto a unicidad y longitud máxima de 180 caracteres en PostgreSQL.
- El UPDATE puede guardar el cambio y luego responder 404 porque `rows` está vacío. El mismo 404 aparece si no existe el ID. No se debe interpretar esa respuesta como garantía de que no se modificaron datos.
- Un nombre duplicado no se captura aquí como conflicto; puede terminar en HTTP 500.
- El servicio contiene el mensaje de éxito `{"message":"faculty has been updated"}`, que correspondería a HTTP 201, pero no se alcanza en el flujo SQL actual. No debe documentarse como éxito operativo.

## 6. POST /faculty/delete

**Explicación:** ejecuta la eliminación de una facultad por ID. El controlador usa actualmente `FacultyUpdateDto`, aunque existe `FacultyDeleteDto` con solo `id`.

**Recibe — headers:** `Authorization: Bearer <access_token>` y `Content-Type: application/json`.

**Recibe actualmente — cuerpo JSON:**

```json
{
  "id": 1,
  "name": "Facultad de Ingeniería"
}
```

| Campo | Tipo | Restricciones |
| --- | --- | --- |
| `id` | number | Obligatorio; es el dato usado para borrar. |
| `name` | string | Obligatorio por el DTO registrado, aunque el servicio no lo utiliza. |

**Retorna actualmente — HTTP 500 si el DELETE termina sin error SQL:**

```json
{
  "statusCode": 500,
  "message": "Internal server error"
}
```

**Restricciones y comportamiento actual:**

- JWT válido y rol ID `1`. Aplican HTTP 401/403 generales.
- Enviar solo `id` produce HTTP 400 porque falta `name` en el DTO usado por el controlador.
- El DELETE no incluye `RETURNING`. Después intenta desestructurar `rows[0]`, que es `undefined`, causando una excepción. Puede borrar el registro y luego responder 500; no se debe reintentar asumiendo que la operación no ocurrió.
- Si no existe el ID, también termina en ese error; el `NotFoundException` posterior no se alcanza.
- Si una fila de `teacher` referencia la facultad, su clave foránea `ON DELETE RESTRICT` impide borrarla. El servicio no captura ese caso y puede devolver HTTP 500.
- El mensaje previsto `{"message":"Faculty has been deleted successfully"}` (HTTP 201 por ser POST) no se alcanza en el flujo actual.
- El método HTTP registrado es POST, no DELETE.

## 7. GET /test

**Explicación:** consulta la tabla `docker_test` y devuelve las filas con `id = 1`. Sirve como comprobación funcional de lectura de la base de datos.

**Recibe — header:**

```http
Authorization: Bearer <access_token>
```

No recibe cuerpo, parámetros de ruta ni query documentados.

**Retorna — HTTP 200:** un arreglo de filas. Ejemplo ilustrativo de la estructura definida en `01_init.sql`:

```json
[
  {
    "id": "1",
    "message": "Base de datos FORJA funcionando, claro que si",
    "created_at": "2026-01-01T00:00:00.000Z"
  }
]
```

El contenido y la fecha dependen de los datos reales. `id` es BIGSERIAL y se serializa normalmente como string con el parser predeterminado de `pg`.

**Restricciones y errores:**

- JWT válido y rol ID `1`. Aplican HTTP 401/403 generales.
- Si no existe una fila con ID 1, devuelve HTTP 200 con `[]`.
- Si falla la conexión o no existe la tabla, el error no se captura y puede devolver HTTP 500.

## Resumen de rutas registradas

| Método | Dirección | Token | Rol ID | Resultado actual principal |
| --- | --- | --- | --- | --- |
| POST | `/auth/register` | No | No aplica | 201: mensaje de registro, cuenta inactiva |
| POST | `/auth/login` | No | No aplica | 201: JWT y usuario activo |
| POST | `/course/create` | Sí | 1 | 201: mensaje de creación |
| POST | `/faculty/create` | Sí | 1 | 201: mensaje de creación |
| POST | `/faculty/update` | Sí | 1 | 404 después de ejecutar UPDATE sin RETURNING |
| POST | `/faculty/delete` | Sí | 1 | 500 después de ejecutar DELETE sin RETURNING |
| GET | `/test` | Sí | 1 | 200: arreglo de filas |

No hay endpoints registrados para listar cursos o facultades, activar usuarios, verificar correo ni administrar proyectos en este commit.
