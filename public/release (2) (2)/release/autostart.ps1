# ===========================================================================
#  HMS - START AUTOMATICALLY WHEN THE COMPUTER TURNS ON
#
#      Double-click  autostart.bat        -> turn it ON
#      Double-click  autostart-off.bat    -> turn it OFF
#
#  It registers a Windows scheduled task that starts HMS at boot, before
#  anyone logs in, and restarts it if it ever stops.
#
#  Why a scheduled task and not the Startup folder: the Startup folder only
#  runs after somebody signs in, and leaves a console window on their desktop
#  that closes HMS if it is closed. A clinic PC is switched on and left; the
#  system has to be up whether or not anybody logs in.
#
#  Why not a Windows service: a Java program cannot be registered as one
#  without a wrapper tool that would have to be downloaded and installed. A
#  scheduled task is built into Windows and needs nothing extra.
# ===========================================================================

param(
    # Remove the task instead of creating it.
    [switch]$Remove,

    # Seconds to wait after boot before starting. PostgreSQL is a service and
    # starts on its own, but not instantly, and HMS cannot open its database
    # until it is up. The task also retries, so this only avoids one noisy
    # failure in the log at every boot.
    [int]$DelaySeconds = 45
)

$ErrorActionPreference = 'Continue'
$TaskName = 'HMS'
$Here     = Split-Path -Parent $MyInvocation.MyCommand.Path
$Jar      = Join-Path $Here 'hms-api.jar'

function Fail($msg) {
    Write-Host ""
    Write-Host "  ============================================================"
    Write-Host "    $msg"
    Write-Host "  ============================================================"
    Write-Host ""
    Read-Host "  Press Enter to close"
    exit 1
}

# Must be an administrator: a task that runs before login is a machine-wide
# setting, and Windows refuses to register one otherwise.
$isAdmin = ([Security.Principal.WindowsPrincipal] `
    [Security.Principal.WindowsIdentity]::GetCurrent()
    ).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Fail "Right-click the file and choose 'Run as administrator'."
}

# ─────────────────────────────────────────────────────────────── remove
if ($Remove) {
    $existing = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
    if (-not $existing) {
        Write-Host ""
        Write-Host "  HMS was not set to start automatically. Nothing to do."
        Write-Host ""
        Read-Host "  Press Enter to close"
        exit 0
    }
    Stop-ScheduledTask  -TaskName $TaskName -ErrorAction SilentlyContinue
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
    Write-Host ""
    Write-Host "  DONE. HMS will no longer start by itself."
    Write-Host "  Start it by hand with start.bat when you need it."
    Write-Host ""
    Read-Host "  Press Enter to close"
    exit 0
}

# ─────────────────────────────────────────────────────────────── install
if (-not (Test-Path $Jar)) {
    Fail "hms-api.jar is not in this folder. Put autostart.bat beside it."
}

# Settings not filled in yet means setup.bat has not been run, and the task
# would boot-loop against a database that does not exist. Say so now.
$yml = Join-Path $Here 'application.yml'
if ((Test-Path $yml) -and (Select-String -Path $yml -Pattern 'CHANGE_ME' -Quiet)) {
    Fail "Run setup.bat first, then this."
}

$java = (Get-Command java -ErrorAction SilentlyContinue).Source
if (-not $java) {
    Fail "Java was not found. Install Java 21, then run this again."
}

# The port comes from application.yml, which setup.bat wrote. Hard-coding one was
# a real bug: this checked 4010 -- a development port -- while the client ran on
# 8226, so a task that had installed perfectly was reported as "not answering"
# and looked like a failure.
$Port = 8226
if (Test-Path $yml) {
    $portLine = Select-String -Path $yml -Pattern '^\s*port:\s*(\d+)' | Select-Object -First 1
    if ($portLine) { $Port = [int]$portLine.Matches[0].Groups[1].Value }
}

Write-Host ""
Write-Host "  Setting HMS to start when this computer turns on..."
Write-Host ""

# Same flags as start.bat: size the heap to the machine, and die rather than
# limp on after running out of memory -- the task restarts it cleanly.
$action = New-ScheduledTaskAction `
    -Execute $java `
    -Argument '-XX:MaxRAMPercentage=75 -XX:+ExitOnOutOfMemoryError -jar hms-api.jar' `
    -WorkingDirectory $Here

$trigger = New-ScheduledTaskTrigger -AtStartup
$trigger.Delay = "PT${DelaySeconds}S"

# SYSTEM: runs with no one logged in, and survives the user signing out.
$principal = New-ScheduledTaskPrincipal `
    -UserId 'SYSTEM' -LogonType ServiceAccount -RunLevel Highest

$settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -RestartInterval (New-TimeSpan -Minutes 1) -RestartCount 999 `
    -ExecutionTimeLimit ([TimeSpan]::Zero)     # never time it out; it runs all day

Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger `
    -Principal $principal -Settings $settings -Force `
    -Description 'Hospital Management System - starts at boot and stays running' | Out-Null

if (-not $?) { Fail "Windows refused to create the task. Read the message above." }

Write-Host "  DONE."
Write-Host ""
Write-Host "  HMS now starts by itself when the computer turns on, and restarts"
Write-Host "  itself if it ever stops."
Write-Host ""
Write-Host "  It waits $DelaySeconds seconds for PostgreSQL, then takes about a minute"
Write-Host "  to start. So allow roughly two minutes after switching on before"
Write-Host "  the screens open. That is normal, and only at boot."
Write-Host ""
Write-Host "  Nobody needs to log in, and there is no window to leave open."
Write-Host ""

# Start it now too, so the person doing the install can check it works
# without rebooting.
Write-Host "  Starting it now so you can check. This takes a minute or two..."
Start-ScheduledTask -TaskName $TaskName

$url = "http://localhost:$Port/api/v1/health"
$ok  = $false
for ($i = 0; $i -lt 40; $i++) {          # up to ~3 minutes
    Start-Sleep -Seconds 5
    try {
        $r = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 3
        if ($r.StatusCode -eq 200) { $ok = $true; break }
    } catch { }
    if ($i % 4 -eq 3) { Write-Host "    still starting..." }
}

Write-Host ""
if ($ok) {
    Write-Host "  IT IS RUNNING."
    Write-Host ""
    Write-Host "  Open this in the browser:   http://localhost:$Port"
} else {
    Write-Host "  It has not answered yet on port $Port."
    Write-Host ""
    Write-Host "  The task is installed either way -- check it with:"
    Write-Host "      Get-ScheduledTask HMS | Get-ScheduledTaskInfo"
    Write-Host ""
    Write-Host "  And read the last lines of  logs\hms-api.log  for the reason."
}
Write-Host ""
Read-Host "  Press Enter to close"
