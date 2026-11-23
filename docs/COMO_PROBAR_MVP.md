# FORJA — Manual de pruebas del MVP

**Rama de trabajo:** `forja/primera-etapa-backend`. **Estado:** prototipo para pruebas locales, no producción institucional. Las pruebas deben utilizar personas, comunidades y proyectos ficticios.

## 1. Preparación

Instalación desde cero: [INSTALACION_COMPANEROS.md](INSTALACION_COMPANEROS.md).

En una instalación existente, desde la raíz `FORJA`:

~~~powershell
git pull origin forja/primera-etapa-backend
cd Docker
docker compose -p forja-dev --env-file .env.dev -f compose.dev.yml up -d --build --force-recreate backend frontend
docker compose -p forja-dev --env-file .env.dev -f compose.dev.yml ps
~~~

Las migraciones de PostgreSQL **no** se ejecutan por este comando: consultar [README — Base de datos](../README.md#base-de-datos-y-persistencia). No borrar carpetas de datos existentes. Abrir `http://localhost:3000/login`.

**Usuarios:** cada entorno necesita una cuenta administrador creada mediante `bootstrap-admin.mjs`; desde «Gestionar usuarios» el administrador crea profesor (rol 3, con facultad) y monitor (rol 2) de prueba. No hay registro público ni contraseña fija.

## 2. Prueba: profesor y semestre actual

1. Entrar como profesor; abrir «Registrar proyecto».
2. Registrar título, problemática, objetivo, comunidad y zona territorial (si el administrador ya cargó el catálogo). Seleccionar ODS en «Consideraciones éticas».
3. Registrar período `2026-2` (o el semestre actual), asignatura, facultad, departamento y carrera, objetivos, actividades, presupuesto, fechas y cantidad de estudiantes. El formulario admite un programa principal por período.
4. Guardar: el proyecto debe recibir código `FORJA-...` y el semestre aparecer como `BORRADOR`.
5. Revisar «Información general», «Períodos académicos» y «Consideraciones éticas» en el detalle. Seleccionar la población externa predominante; completar la declaración de veracidad.
6. Enviar a revisión. Si faltan datos obligatorios, el servidor debe enumerarlos. Corregirlos sin duplicar el período.
7. Entrar como administrador: consultar el período `EN_REVISION`, aprobarlo o devolverlo con observaciones. Si fue devuelto, el profesor puede corregir y reenviar.
8. Con el semestre aprobado, el profesor puede subir evidencias **PDF de hasta 20 MB**; el administrador revisa cada PDF (`APROBADA` / `DEVUELTA`).
9. Registrar resultados y conclusiones; cerrar el período como administrador solo después de tener evidencia aprobada y ninguna pendiente.
10. Verificar que el proyecto pueda seguir `ACTIVO` aunque un semestre ya esté `CERRADO`. Solo el administrador marca la finalización definitiva, sujeto a los estados de los períodos actuales.

> Nota: el ejemplo `2026-2` sirve para las pruebas descritas en noviembre de 2026. En semestres futuros utilizar el período vigente.

## 3. Prueba: monitor y proyectos históricos

1. Entrar como monitor y seleccionar «Digitalizar proyecto histórico».
2. Registrar información disponible; dejar vacíos los campos desconocidos y escribir «Información faltante».
3. Crear un período académico **anterior al semestre actual** y guardar **sin pedir aprobación retroactiva**.
4. Adjuntar, si existen, las evidencias PDF y la carta final firmada de ese semestre; el monitor puede archivarlas sin aprobar retrospectivamente.
5. Comprobar que el monitor tiene el mismo formulario general/semestre que el profesor, con campos adicionales para profesor histórico y datos faltantes.
6. Para continuar un histórico **activo**, el administrador asigna un profesor; este crea el período **actual** en el mismo código FORJA y solicita aprobación por el flujo normal.
7. Confirmar que un semestre histórico y uno actual permanecen independientes.

## 4. Carta firmada y evaluación de la comunidad (por semestre)

**La carta firmada y la evaluación comunitaria pertenecen al mismo período académico, pero son registros distintos.**

1. Seleccionar un período histórico o un semestre actual aprobado y **cerrado**.
2. Como administrador o monitor, archivar **solo el PDF final firmado** de la carta, preparado externamente. Debe poder consultarse desde el semestre.
3. Como administrador, abrir «Evaluación de la comunidad del semestre» y generar enlace privado.
4. Abrir ese enlace en una **ventana de incógnito** sin iniciar sesión. Verificar código FORJA y semestre correctos.
5. Completar el **formulario institucional de 19 preguntas**, incluidas las 14 afirmaciones con escala Likert y la línea de acción; autorizar el almacenamiento de datos.
6. Enviar; la respuesta debe guardarse una sola vez y el enlace dejar de funcionar. El token tiene vigencia máxima de 14 días y regenerarlo invalida el anterior.
7. Volver como administrador al semestre y verificar las respuestas.
8. Seleccionar **otro semestre del mismo proyecto**: debe permitir su propia evaluación sin sobrescribir la anterior.
9. Las antiguas respuestas MVP (`MVP_2026`) se conservan para pruebas y se distinguen del instrumento institucional (`INSTITUCIONAL_2026`). Un semestre que ya respondió **no** puede contestar otra vez.

**Datos personales:** el formulario recoge datos de contacto. No utilizar información real ni compartir enlaces/tokens sin autorización; revisar tratamiento de datos antes del despliegue.

## 5. Reportes y exportación administrativa

Como administrador, abrir `/proyectos`. Probar los filtros desplegables:

| Filtro | Origen de la información |
| --- | --- |
| Año de inicio | Fecha general de inicio o año académico más antiguo; como último recurso, año de registro en la plataforma. |
| Zona territorial | Catálogo administrable de zonas y relación con el proyecto. |
| Departamento académico | Departamento asociado a los semestres registrados. |
| Carrera / programa | Programa principal por semestre (coincidencia de carrera y departamento dentro del mismo semestre). |
| ODS | Los **17 Objetivos de Desarrollo Sostenible** asignados al proyecto. |
| Población externa predominante | Información guardada en «Consideraciones éticas». |

1. Elegir un año y una zona; comprobar la cantidad de proyectos coincidentes.
2. Combinar ODS y población externa; comprobar que el resultado corresponde al criterio.
3. Descargar **Excel con estos filtros** (solo admin).
4. Abrir el `.xlsx` y comprobar las hojas **Proyectos** y **Semestres**, los encabezados y los datos filtrados.
5. Confirmar que «Año de inicio» aparece en «Proyectos». «Estudiantes (suma semestral)» no equivale a número de individuos únicos.
6. Comprobar que el Excel **no expone** nombres, teléfonos, correos de contacto ni respuestas personales de comunidades.
7. Entrar como profesor o monitor: el botón de exportación administrativa debe estar oculto y el endpoint devolver acceso denegado.

## 6. Navegación

En «Proyectos registrados», «Gestionar usuarios» y «Administrar zonas» verificar que la barra superior usa controles del mismo tamaño y se adapta a pantallas pequeñas.

## 7. Qué falta validar antes de producción

- Nombres oficiales de las siete zonas y posibles cambios en los catálogos académicos.
- Política de privacidad, permisos de acceso, conservación y eliminación de respuestas.
- Seguridad de archivos, análisis antivirus, límites de peticiones al formulario público.
- Registro simultáneo de varias carreras por semestre, si FORJA lo requiere.
- Pruebas automatizadas end-to-end, restauración de respaldos y publicación HTTPS.

**Referencia:** [README principal](../README.md), [especificación](ESPECIFICACION_FUNCIONAL_MVP.md), [estado de implementación](ESTADO_IMPLEMENTACION.md).
