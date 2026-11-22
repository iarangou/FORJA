# FORJA — Lista de verificación documental (propuesta de desarrollo)

> **Supuestos:** no hay acceso a un inventario oficial de formatos. Estos requisitos se usan como checklist inicial configurable; **no se deben publicar como política institucional sin validación**.

| Código | Documento / requisito | Momento | Regla propuesta | Quién lo carga |
|---|---|---|---|---|
| DOC-01 | Formulario general del proyecto completo | Enviar semestre actual a revisión | Obligatorio (datos almacenados en sistema) | Profesor |
| DOC-02 | Plan del período: objetivos, actividades, fechas, estudiantes, presupuesto | Enviar semestre a revisión | Obligatorio como campos; archivo de apoyo opcional | Profesor |
| DOC-03 | Análisis previo de consideraciones éticas | Enviar primer semestre actual | Obligatorio como formulario digital | Profesor |
| DOC-04 | Aval de organización / permiso institucional | No es requisito automático de envío | No se exige por seleccionar población vulnerable; cualquier solicitud excepcional la evalúa el administrador | No aplica por defecto |
| DOC-05 | Autorización de uso de imagen/testimonio | Publicación externa de material identificable, si corresponde | Debe revisarse según normas aplicables, **no forma parte del bloqueo automático de aprobación del período** | Según corresponda |
| DOC-06 | Evidencias de ejecución (Word, PDF, imágenes, videos) | Durante ejecución y cierre | Al menos una evidencia válida antes del cierre del período (supuesto) | Profesor |
| DOC-07 | Resultados y conclusiones | Cierre del período | Obligatorio antes del cierre; es registro digital | Profesor |
| DOC-08 | Evaluación de la comunidad | Cierre de proyecto o antes, según flujo | Una respuesta por proyecto, mediante enlace controlado | Comunidad |
| DOC-09 | Carta final firmada | Cuando FORJA emita carta | Se almacena **solo archivo final firmado**; no bloquea creación del proyecto | Administrador |

## Lista de revisión del administrador

- [ ] Existe proyecto y código único
- [ ] Período académico correcto y sin duplicados
- [ ] Docente responsable y asignatura(s) informados
- [ ] Comunidad y territorio(s) descritos (si están disponibles)
- [ ] Objetivos, actividades, presupuesto y cantidad de estudiantes presentes
- [ ] Análisis ético completado, con coherencia respecto a la población
- [ ] Información de población y análisis ético revisada; el administrador puede aprobar o devolver con observaciones. Sin exigencia automática de avales
- [ ] Evidencias válidas, si se revisa ejecución o cierre
- [ ] No hay archivos que revelen datos personales innecesarios
- [ ] Observaciones registradas si se devuelve el período
- [ ] La decisión de aprobación/devolución queda guardada con fecha y administrador

## Históricos

El monitor puede **guardar sin documentos** cuando no existen registros disponibles. Se marca el período como `HISTORICO`, se registran los campos conocidos y se escribe la lista de faltantes, **sin inventar datos ni marcar evidencia como aprobada**. El semestre actual lo ingresa el profesor y sigue el flujo habitual de aprobación.

## Seguridad y almacenamiento

Validar MIME/extension y tamaño, restringir permisos por rol, almacenar archivos fuera del árbol público de Next.js, escanear contenido malicioso, almacenar rutas o claves seguras y ofrecer respaldos. Una lista en el frontend **no sustituye controles de backend**.
