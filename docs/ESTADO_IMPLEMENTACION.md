# FORJA — Estado del desarrollo (22 de noviembre de 2026)

> Este documento distingue código implementado, flujo pendiente y supuestos. El hecho de que exista un endpoint no implica que haya sido probado con datos reales ni que el proceso institucional esté validado.

## Implementado en la rama `forja/primera-etapa-backend`

| Área | Implementación en esta etapa |
|---|---|
| Proyectos | Alta y consulta con código único autogenerado, título, problemática, objetivo, justificación, organización y ODS |
| Acceso | Autenticación JWT existente; bloqueo del autorregistro; bootstrap seguro del primer administrador |
| Permisos | Roles aplicados a rutas de proyectos; profesor ve proyectos propios/asignados, administrador y monitor acceden para su labor |
| Períodos | Registro por año-semestre con estado de aprobación independiente; separación actual/histórico |
| Ética | Formulario de categorías agregadas y medidas de privacidad; almacenamiento inicial por proyecto |
| Revisión | Profesor solicita aprobación; administrador aprueba/devuelve y guarda historial de decisiones |
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
- Resultados, conclusiones, cierre de período y finalización general del proyecto por administrador
- Exportar informes Excel por territorio; permisos de descarga y backups verificados
- Integración y pruebas con PostgreSQL y Docker, tests de API, revisión de validaciones/seguridad

## Precauciones conocidas

- El registro de evidencia está modelado en SQL, **pero no hay subida de archivos implementada**.
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
