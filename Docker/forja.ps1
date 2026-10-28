
param(
    [Parameter(Mandatory = $true, Position = 0)]
    [ValidateSet('dev', 'prod')]
    [string]$Target,

    [Parameter(Mandatory = $true, Position = 1)]
    [ValidateSet(
        'up', 'down', 'restart', 'logs',
        'ps', 'backup-db', 'reset-db'
    )]
    [string]$Action
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# Rutas relativas al propio script
$root = $PSScriptRoot
$envFile = Join-Path $root ".env.$Target"
$composeFile = Join-Path $root "compose.$Target.yml"
$projectName = "forja-$Target"

# Validaciones iniciales
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    throw 'Docker no está instalado o no está en PATH.'
}

if (-not (Test-Path -LiteralPath $composeFile -PathType Leaf)) {
    throw "No existe: $composeFile"
}

if (-not (Test-Path -LiteralPath $envFile -PathType Leaf)) {
    throw "No existe: $envFile"
}

# Argumentos comunes para Docker Compose
$composeArgs = @(
    'compose', '-p', $projectName,
    '--env-file', $envFile,
    '-f', $composeFile
)

# Ejecutar Compose y verificar errores
function Invoke-Compose {
    param([string[]]$CommandArgs)

    & docker @composeArgs @CommandArgs

    if ($LASTEXITCODE -ne 0) {
        throw "Docker Compose falló (código $LASTEXITCODE)"
    }
}

switch ($Action) {

    'up' {
        Write-Host "Iniciando FORJA $Target..." -ForegroundColor Cyan
        Invoke-Compose @('up', '-d', '--build')
        Invoke-Compose @('ps')
    }

    'down' {
        Write-Host "Deteniendo FORJA $Target..." -ForegroundColor Cyan
        Invoke-Compose @('down')
    }

    'restart' {
        Write-Host "Reiniciando FORJA $Target..." -ForegroundColor Cyan
        Invoke-Compose @('restart')
    }

    'logs' {
        Write-Host "Logs de FORJA $Target (Ctrl+C para salir)..."
        Invoke-Compose @('logs', '-f', '--tail', '100')
    }

    'ps' {
        Invoke-Compose @('ps')
    }

    'backup-db' {

        $backupDir = Join-Path (Join-Path $root 'backups') $Target

        New-Item -ItemType Directory -Force -Path $backupDir |
            Out-Null

        $timestamp = Get-Date -Format 'yyyyMMdd-HHmmss-fff'
        $fileName = "forja-$Target-$timestamp.dump"

        $containerPath = "/tmp/$fileName"
        $localPath = Join-Path $backupDir $fileName

        Write-Host "Creando respaldo de PostgreSQL ($Target)..."

        $dumpCommand = 'PGPASSWORD="$POSTGRES_PASSWORD" pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc -f "' + $containerPath + '"'

        try {
            Invoke-Compose @(
                'exec', '-T', 'database',
                'sh', '-c', $dumpCommand
            )

            Invoke-Compose @(
                'cp',
                "database:$containerPath",
                $localPath
            )

            if (-not (Test-Path -LiteralPath $localPath -PathType Leaf)) {
                throw 'No se encontró el archivo de respaldo.'
            }

            if ((Get-Item -LiteralPath $localPath).Length -eq 0) {
                throw 'El archivo de respaldo está vacío.'
            }

            Write-Host "Respaldo guardado en: $localPath" -ForegroundColor Green

        } finally {
            & docker @composeArgs 'exec' '-T' 'database' `
                'rm' '-f' $containerPath | Out-Null
        }
    }

    'reset-db' {

        # Bloquear el borrado de producción
        if ($Target -ne 'dev') {
            throw 'PROHIBIDO: reset-db solo está permitido en DEV.'
        }

        $devData = Join-Path $root 'database/data/dev'

        Write-Warning "Se eliminarán TODOS los datos DEV en: $devData"

        $confirmation = Read-Host 'Escribe BORRAR-DEV para confirmar'

        if ($confirmation -cne 'BORRAR-DEV') {
            Write-Host 'Operación cancelada.'
            break
        }

        # Evitar borrar una ruta inesperada
        if (Test-Path -LiteralPath $devData) {

            $item = Get-Item -LiteralPath $devData -Force

            if (-not $item.PSIsContainer) {
                throw 'La ruta de datos DEV no es una carpeta.'
            }

            if (($item.Attributes -band [System.IO.FileAttributes]::ReparsePoint) -ne 0) {
                throw 'La carpeta DEV es un enlace. No se borrará.'
            }
        }

        # Apagar antes de eliminar los archivos
        Write-Host 'Apagando DEV...'
        Invoke-Compose @('down')

        # Eliminar únicamente la carpeta DEV
        if (Test-Path -LiteralPath $devData) {
            Remove-Item -LiteralPath $devData -Recurse -Force
        }

        New-Item -ItemType Directory -Path $devData -Force |
            Out-Null

        # Reinicializar PostgreSQL
        Write-Host 'Iniciando DEV con una base de datos vacía...'
        Invoke-Compose @('up', '-d', '--build')
        Invoke-Compose @('ps')

        Write-Host 'Revisa los logs de database para verificar init.sql.'
    }
}
