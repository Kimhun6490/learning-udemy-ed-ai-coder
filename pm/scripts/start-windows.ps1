$ErrorActionPreference = "Stop"

$imageName = "pm-mvp"
$containerName = "pm-mvp-app"
$rootDir = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $rootDir ".env"

Set-Location $rootDir

docker build -t $imageName .
docker rm -f $containerName 2>$null | Out-Null

if (Test-Path $envFile) {
  docker run -d --name $containerName -p 8000:8000 --env-file $envFile $imageName
} else {
  docker run -d --name $containerName -p 8000:8000 $imageName
}

for ($i = 0; $i -lt 30; $i++) {
  try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/api/health" -UseBasicParsing
    if ($response.StatusCode -eq 200) {
      break
    }
  } catch {
    Start-Sleep -Seconds 1
  }
}

$finalCheck = Invoke-WebRequest -Uri "http://localhost:8000/api/health" -UseBasicParsing
if ($finalCheck.StatusCode -ne 200) {
  throw "Container failed readiness check at /api/health"
}

Write-Output "Started $containerName at http://localhost:8000"
