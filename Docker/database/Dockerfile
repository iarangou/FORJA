
FROM postgres:17-alpine

# Copiar los scripts SQL de inicialización
COPY ./init/ /docker-entrypoint-initdb.d/

# Puerto interno de PostgreSQL
EXPOSE 5432
