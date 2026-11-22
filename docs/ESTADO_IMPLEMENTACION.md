# FORJA — Estado del desarrollo (22 de noviembre de 2026)

> Este documento distingue código implementado, flujo pendiente y supuestos. El hecho de que exista un endpoint no implica que haya sido probado con datos reales ni que el proceso institucional esté validado.

## Implementado en la rama `forja/primera-etapa-backend`

| Área | Implementación en esta etapa |
|---|---|
| Proyectos | Alta y consulta con código único autogenerado, título, problemática, objetivo, justificación, organización y ODS |
| Acceso | Autenticación JWT existente; bloqueo del autorregistro; bootstrap seguro del primer administrador |
| Permisos | Roles aplicados a rutas de proyectos; profesor ve proyectos propios/asignados, administrador y monitor acceden para su labor |
| Períodos | Registro por año-semestre con estado de aprobación independiente; separación actual/histórico |
| Digitalización histórica | Monitor registra y corrige semestres anteriores con datos incompletos, sin aprobación retroactiva; administrador asigna profesor responsable para continuidad del semestre actual |
| Ética | Formulario de categorías agregadas y medidas de privacidad; almacenamiento inicial por proyecto |
| Revisión | Profesor solicita aprobación; administrador aprueba/devuelve y guarda historial de decisiones |
| Ejecución y cierre | Profesor guarda resultados y conclusiones de semestre aprobado; administrador cierra tras comprobar al menos un PDF aprobado y ninguno pendiente |
| Finalización general | Administrador finaliza proyecto únicamente si los períodos actuales están aprobados y cerrados; no elimina el historial |
| Interfaz | `/proyectos` y `/proyectos/nuevo`; acceso desde login y consulta de períodos |
| Infraestructura | Migraciones SQL incrementales de desarrollo y Action de comprobación de compilación |
| Documentación | Especificación asumida, checklist documental, ejemplo ficticio y guía de instalación |

## Pendientes funcionales relevantes

- Edición de borradores guardados y correcciones después de devolución (PATCH por período y proyecto)
- Carga, consulta y revisión segura de documentos/evidencias y carta final firmada
- Panel administrativo para crear profesores y monitores, cambio obligatorio de contraseña temporal
- Incorporar múltiples asignaturas/profesores/carreras por período y catálogo definitivo de siete territorios
- Gestión real de ODS, población beneficiaria y presupuestos pormenorizados en formularios
- Formulario comunitario de una respuesta por proyecto con enlace/token seguro
- La finalización general por administrador se implementó con confirmación y bloqueo de períodos actuales abiertos. Pendiente probarla con Docker, revisar reglas especiales para históricos y confirmar requisitos con FORJA.
- Exportar informes Excel por territorio; permisos de descarga y backups verificados
- Integración y pruebas con PostgreSQL y Docker, tests de API, revisión de validaciones/seguridad

## Precauciones conocidas

- Existe carga de evidencias **exclusivamente PDF** vinculadas al semestre aprobado, descarga autenticada y revisión administrativa; falta validación integral en Docker y antimalware antes de producción.
- El envío a revisión no está condicionado a avales automáticos por tipo de población. El administrador aprueba o devuelve después de revisar la información.
- El formulario ético es una propuesta basada en el archivo disponible; no afirmar que es un formato institucional oficial definitivo.
- La cuenta admin se crea manualmente con `npm run bootstrap:admin`; la base nueva no instala usuarios con claves de prueba.
- Los scripts de `/docker-entrypoint-initdb.d/` se ejecutan automáticamente **solo en bases nuevas**. No resetear bases con datos.
- CI valida compilación cuando termine de ejecutarse; no sustituye pruebas end-to-end ni aprobación de FORJA.
- El PR #1 está abierto como **borrador** y no debe fusionarse a `main` antes de revisar las comprobaciones.

## Próximas prioridades recomendadas

1. Endpoint seguro de actualización de borradores, períodos y resubmisión.
2. Carga documental con almacenamiento no público y validación de tipos, límites y permisos.
3. Panel de administrador y profesor completo con edición.
4. Evaluación comunitaria + exportaciones.
5. Pruebas funcionales y endurecimiento para despliegue.

La meta es lograr coherencia entre requisitos, datos, backend y pantallas sin inventar procesos institucionales que nunca fueron suministrados.

## Cómo probar la digitalización histórica

1. Como administrador, crear una cuenta de monitor en `/administracion/usuarios`.
2. Ingresar con el monitor y crear un proyecto tipo **Histórico** en `/proyectos/nuevo` con, por ejemplo, el período 2024-2. Los campos desconocidos quedan vacíos y se explican en «Información faltante».
3. Abrir el proyecto, desplegar **Digitalización histórica**, registrar otro período anterior y comprobar que no requiere aprobación retroactiva.
4. Ingresar como administrador, abrir el mismo proyecto y asignar un profesor responsable en esa sección. Si el proyecto histórico sigue activo, el profesor podrá abrir un período **ACTUAL**.
5. Como profesor, crear el período 2026-2, completar sus campos y el análisis ético. Enviarlo a aprobación administrativa por el procedimiento habitual. No modificar los períodos históricos para simular el semestre actual.

**No se deben ejecutar resets de la base para estas pruebas.** La función de asignación de docente no permite reasignar desde la interfaz una vez registrado un período actual. Las reglas especiales para casos históricos excepcionales requieren validación con FORJA antes de producción.
