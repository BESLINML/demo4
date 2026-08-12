# ═══════════════════════════════════════════════════════════════════════════
#  HMS — STOP THE SERVER
#
#  Run stop.bat (as administrator).
#
#  Stopping is not just "kill java". If HMS was set to start automatically the
#  scheduled task restarts it within the minute, so a plain kill looks like it
#  worked and then the server is back. This pauses the task first, and leaves it
#  paused — start.bat, or stop.bat's partner autostart.bat, turns it back on.
#
#  Nothing is deleted. No data is touched. This only stops the program.
# ═══════════════════════════════════════════════════════════════════════════
param(
  [string]$Target = 'C:\HMS'
)

$ErrorActionPreference = 'Stop'
$TaskName = 'HMS'

function Say($m, $c = 'Gray') { Write-Host $m -ForegroundColor $c }
function Ok($m)  { Write-Host "  [OK]   $m" -ForegroundColor Green }
function Bad($m) { Write-Host "  [STOP] $m" -ForegroundColor Red }

Say ''
Say '===============================================' Cyan
Say '  STOPPING HMS' Cyan
Say '===============================================' Cyan
Say ''

# The port from the customer's own settings, so this works whatever they chose.
$port = 8226
$yml = Join-Path $Target 'application.yml'
if (-not (Test-Path $yml)) { $yml = Join-Path $PSScriptRoot 'application.yml' }
if (Test-Path $yml) {
  $m = Select-String -Path $yml -Pattern '^\s*port:\s*(\d+)' | Select-Object -First 1
  if ($m) { $port = [int]$m.Matches[0].Groups[1].Value }
}

# Pause auto-start BEFORE stopping java, or the task simply starts it again.
$task = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
if ($task) {
  try { Stop-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue } catch {}
  try { Disable-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue | Out-Null } catch {}
  Ok 'Auto-start paused (so it cannot come back on its own)'
}

# Only the java holding HMS's port. Other Java software on this PC is left alone.
$conn = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
if ($conn) {
  try { Stop-Process -Id $conn.OwningProcess -Force -ErrorAction Stop } catch {}
} else {
  Ok "Nothing was listening on port $port"
}

$free = $false
foreach ($i in 1..20) {
  Start-Sleep -Milliseconds 500
  if (-not (Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue)) { $free = $true; break }
}

Say ''
if ($free) {
  Say '===============================================' Green
  Say '  HMS IS STOPPED' Green
  Say '===============================================' Green
  Say ''
  Say '  Staff cannot use the system until it is started again.'
  Say '  To start it:  double-click start.bat'
  if ($task) {
    Say '  To make it start by itself again after a restart:'
    Say '    right-click autostart.bat -> Run as administrator'
  }
} else {
  Bad "Something is still listening on port $port."
  Say '       If a start.bat window is open, close it, then run this again.' Yellow
}
Say ''
Read-Host 'Press Enter to close'
