# ═══════════════════════════════════════════════════════════════════════════
#  HMS — UPDATE AN INSTALLATION THAT IS ALREADY RUNNING
#
#  Run update.bat (as administrator) from the NEW release folder.
#
#  Why this script exists: updating by hand fails at the same place every time.
#  The jar cannot be overwritten while java is running, and if HMS was set to
#  start automatically the scheduled task puts it straight back — so you kill
#  java, the file unlocks for a few seconds, the task restarts it, and it is
#  locked again. The only reliable order is: disable the task, stop java, copy,
#  re-enable. That order is what this file is.
#
#  It never touches application.yml and never touches the database. Settings and
#  data belong to the customer; only the program is replaced.
# ═══════════════════════════════════════════════════════════════════════════
param(
  # Where HMS is installed on this PC.
  [string]$Target = 'C:\HMS'
)

$ErrorActionPreference = 'Stop'
$TaskName = 'HMS'
$here = Split-Path -Parent $MyInvocation.MyCommand.Path

function Say($m, $c = 'Gray') { Write-Host $m -ForegroundColor $c }
function Ok($m)  { Write-Host "  [OK]   $m" -ForegroundColor Green }
function Bad($m) { Write-Host "  [STOP] $m" -ForegroundColor Red }

Say ''
Say '===============================================' Cyan
Say '  HMS UPDATE' Cyan
Say '===============================================' Cyan
Say ''

# ── Check the new files are here ───────────────────────────────────────────
$newJar = Join-Path $here 'hms-api.jar'
$newWeb = Join-Path $here 'web'
if (-not (Test-Path $newJar) -or -not (Test-Path $newWeb)) {
  Bad "hms-api.jar or web\ not found next to this file."
  Say "       Run this from the NEW release folder." Yellow
  Read-Host 'Press Enter to close'; exit 1
}
if (-not (Test-Path (Join-Path $Target 'hms-api.jar'))) {
  Bad "No HMS found at $Target"
  Say "       This script updates an existing install. For a new PC use setup.bat." Yellow
  Read-Host 'Press Enter to close'; exit 1
}
Ok "New version found here"
Ok "Existing HMS found at $Target"

# The port it is actually running on, read from the customer's own settings so
# this works whatever they chose. Falls back to the template's 8226.
$port = 8226
$yml = Join-Path $Target 'application.yml'
if (Test-Path $yml) {
  $m = Select-String -Path $yml -Pattern '^\s*port:\s*(\d+)' | Select-Object -First 1
  if ($m) { $port = [int]$m.Matches[0].Groups[1].Value }
}
Say "  Port: $port"
Say ''

# ── 1. Stop it, and stop it coming back ────────────────────────────────────
Say '1. Stopping HMS...' Cyan
$task = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
if ($task) {
  # Disable before stopping. Stopping alone leaves the boot/retry trigger armed,
  # and it restarts within the minute — locking the jar again mid-copy.
  try { Stop-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue } catch {}
  try { Disable-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue | Out-Null } catch {}
  Ok 'Auto-start paused'
} else {
  Ok 'No auto-start task (started by hand)'
}

# Only the java holding HMS's port — the PC may run other Java software.
$conn = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
if ($conn) {
  try { Stop-Process -Id $conn.OwningProcess -Force -ErrorAction Stop } catch {}
}

$free = $false
foreach ($i in 1..20) {
  Start-Sleep -Milliseconds 500
  if (-not (Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue)) { $free = $true; break }
}
if (-not $free) {
  Bad "HMS is still running on port $port."
  Say "       Close the start.bat window if one is open, then run this again." Yellow
  if ($task) { try { Enable-ScheduledTask -TaskName $TaskName | Out-Null } catch {} }
  Read-Host 'Press Enter to close'; exit 1
}
Ok 'HMS stopped'
Say ''

# ── 2. Keep the old version ────────────────────────────────────────────────
Say '2. Keeping a copy of the old version...' Cyan
$stamp = Get-Date -Format 'yyyy-MM-dd-HHmm'
$backupDir = Join-Path $Target ("previous-" + $stamp)
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
Copy-Item (Join-Path $Target 'hms-api.jar') $backupDir -Force
if (Test-Path (Join-Path $Target 'web')) {
  Copy-Item (Join-Path $Target 'web') $backupDir -Recurse -Force
}
Ok "Old version saved in $backupDir"
Say ''

# ── 3. Put the new version in ──────────────────────────────────────────────
Say '3. Installing the new version...' Cyan
# application.yml is NOT copied: it holds this customer's database password,
# hospital name and port. The database is not touched either — the server
# migrates it itself on the next start.
Copy-Item $newJar (Join-Path $Target 'hms-api.jar') -Force
Remove-Item (Join-Path $Target 'web') -Recurse -Force -ErrorAction SilentlyContinue
Copy-Item $newWeb (Join-Path $Target 'web') -Recurse -Force
Ok 'New program installed'
Ok 'Your settings and your data were not touched'
Say ''

# ── 4. Start it again ──────────────────────────────────────────────────────
Say '4. Starting HMS...' Cyan
if ($task) {
  try { Enable-ScheduledTask -TaskName $TaskName | Out-Null } catch {}
  try { Start-ScheduledTask -TaskName $TaskName } catch {}
  Ok 'Auto-start switched back on'
} else {
  Start-Process -FilePath (Join-Path $Target 'start.bat') -WorkingDirectory $Target
  Ok 'Started'
}

Say '   Waiting for it to come up (can take a minute the first time)...'
$up = $false
foreach ($i in 1..90) {
  Start-Sleep -Seconds 2
  try {
    $r = Invoke-WebRequest -Uri "http://localhost:$port/actuator/health/readiness" -UseBasicParsing -TimeoutSec 3
    if ($r.Content -match 'UP') { $up = $true; break }
  } catch {}
}

Say ''
if ($up) {
  Say '===============================================' Green
  Say '  UPDATE FINISHED. HMS IS RUNNING.' Green
  Say '===============================================' Green
  Say ""
  Say "  Open:  http://localhost:$port"
} else {
  Say '===============================================' Red
  Say '  HMS DID NOT START' Red
  Say '===============================================' Red
  Say ''
  Say "  Look in $Target\logs\ for the reason." Yellow
  Say '  To go back to the old version, copy hms-api.jar and web' Yellow
  Say "  from $backupDir back into $Target" Yellow
}
Say ''
Read-Host 'Press Enter to close'
